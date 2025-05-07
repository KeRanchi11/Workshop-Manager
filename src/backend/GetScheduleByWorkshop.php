<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

$host = 'localhost';
$dbname = 'workshop_management';
$username = 'root';
$password = '';

try {
    $connection = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

$workshop_id = isset($_GET['workshop_id']) ? (int)$_GET['workshop_id'] : 0;

if ($workshop_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'workshop_id نامعتبر است']);
    exit();
}

try {
    $stmt = $connection->prepare("SELECT material_name, delivery_day, quantity FROM schedules WHERE workshop_id = ?");
    $stmt->execute([$workshop_id]);
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ساختار داده‌ها رو برای تطبیق با phases تنظیم می‌کنیم
    $result = [];
    foreach ($schedules as $schedule) {
        $material = $schedule['material_name'];
        if (!isset($result[$material])) {
            $result[$material] = [
                'material_name' => $material,
                'selected_dates' => [],
                'quantities' => [],
            ];
        }
        $result[$material]['selected_dates'][] = $schedule['delivery_day'];
        $result[$material]['quantities'][$schedule['delivery_day']] = $schedule['quantity'];
    }

    echo json_encode(['success' => true, 'schedules' => array_values($result)]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error fetching schedules: ' . $e->getMessage()]);
}

$connection = null;
?>