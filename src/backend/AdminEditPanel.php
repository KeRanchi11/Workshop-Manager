<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json'); // Ensure JSON response

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0); // Respond to OPTIONS preflight request
}

// Database configuration
$host = 'localhost';
$dbname = 'workshop_management';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    error_log("Database connection successful");
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

try {
    if (!isset($pdo)) {
        throw new Exception('Database connection not initialized');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    error_log('Received input: ' . print_r($input, true));

    if (!$input || !isset($input['workshop_id']) || !isset($input['phases'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid input data', 'debug' => 'Missing workshop_id or phases']);
        exit;
    }

    $workshop_id = (int)$input['workshop_id'];
    $phases = $input['phases'];

    if ($workshop_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid workshop ID', 'debug' => 'workshop_id must be greater than 0']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM workshops WHERE id = ?");
    $stmt->execute([$workshop_id]);
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Workshop not found', 'debug' => "No workshop with ID $workshop_id"]);
        exit;
    }

    $pdo->beginTransaction();

    // حذف برنامه‌ریزی‌های قبلی (در صورت نیاز)
    $stmt = $pdo->prepare("DELETE FROM schedules WHERE workshop_id = ?");
    $stmt->execute([$workshop_id]);
    error_log("Deleted existing schedules for workshop_id: $workshop_id");

    $stmt = $pdo->prepare("
        INSERT INTO schedules (workshop_id, material_name, delivery_day, quantity)
        VALUES (?, ?, ?, ?)
    ");

    $inserted_schedules = [];
    $skipped_phases = [];
    foreach ($phases as $phase) {
        $material_name = trim($phase['material'] ?? '');
        error_log("Processing phase with material: $material_name");
        if (empty($material_name) || empty($phase['selectedDates'])) {
            $skipped_phases[] = ['phase' => $phase['phase'] ?? 'unknown', 'reason' => 'Empty material or dates'];
            error_log("Skipping phase due to empty material or dates: " . print_r($phase, true));
            continue;
        }

        foreach ($phase['selectedDates'] as $index => $date) {
            $quantity = isset($phase['quantities'][$date]) ? (int)$phase['quantities'][$date] : 0;
            error_log("Processing date: $date, quantity: $quantity");
            if ($quantity <= 0) {
                $skipped_phases[] = ['phase' => $phase['phase'] ?? 'unknown', 'date' => $date, 'reason' => 'Invalid quantity'];
                error_log("Skipping date due to invalid quantity: $quantity");
                continue;
            }

            $dateTime = DateTime::createFromFormat('Y-m-d', $date);
            if ($dateTime === false || $date !== $dateTime->format('Y-m-d')) {
                $skipped_phases[] = ['phase' => $phase['phase'] ?? 'unknown', 'date' => $date, 'reason' => 'Invalid date format'];
                error_log("Invalid date format for date: $date");
                continue;
            }

            $stmt->execute([$workshop_id, $material_name, $date, $quantity]);
            $inserted_schedules[] = [
                'material_name' => $material_name,
                'delivery_day' => $date,
                'quantity' => $quantity
            ];
            error_log("Inserted schedule: workshop_id=$workshop_id, material=$material_name, date=$date, quantity=$quantity");
        }
    }

    $pdo->commit();
    error_log("Transaction committed, inserted schedules: " . print_r($inserted_schedules, true));

    echo json_encode([
        'success' => true,
        'message' => 'Schedules saved successfully',
        'schedules' => $inserted_schedules,
        'skipped' => $skipped_phases,
        'debug' => count($inserted_schedules) . ' schedules inserted'
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
        error_log("Transaction rolled back due to error");
    }
    error_log("Error in AdminEditPanel.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'debug' => 'Exception occurred during processing'
    ]);
}
?>