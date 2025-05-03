<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
// اطلاعات اتصال به پایگاه داده
$host = 'localhost';    // آدرس سرور دیتابیس (داخل لوکال معمولاً localhost)
$dbname   = 'workshop_management'; // نام دیتابیس را اینجا وارد کنید
$user = 'root'; // نام کاربری دیتابیس
$pass = ''; // رمز عبور دیتابیس
$charset = 'utf8mb4';

// ساخت اتصال PDO
$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // مدیریت خطاها به صورت Exception
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // خروجی پیش‌فرض بصورت آرایه انجمنی
    PDO::ATTR_EMULATE_PREPARES   => false,                  // بهبود امنیت و کارایی
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["success"=>false, "message"=>"خطا در اتصال به پایگاه داده: " . $e->getMessage()]);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // نمونه: schedulepanel.php?workshop_id=XX
    if (!isset($_GET['workshop_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing workshop_id.']);
        exit;
    }
    $workshop_id = intval($_GET['workshop_id']);

    // ۷ روز از امروز
    $startDate = date('Y-m-d');
    $endDate = date('Y-m-d', strtotime('+6 days'));

    // دریافت تمام زمان‌بندی‌های این کارگاه در بازه موردنظر
    $stmt = $pdo->prepare('
        SELECT material_name, delivery_day, quantity
        FROM schedules
        WHERE workshop_id = ? AND delivery_day BETWEEN ? AND ?
    ');
    $stmt->execute([$workshop_id, $startDate, $endDate]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // مواد و جدول داینامیک
    $materials = [];
    foreach ($rows as $row) {
        $materials[$row['material_name']][$row['delivery_day']] = $row['quantity'];
    }

    echo json_encode([
        'status' => 'success',
        'materials' => $materials
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['workshop_id']) || !isset($input['data'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing data.']);
        exit;
    }

    $workshop_id = intval($input['workshop_id']);
    $data = $input['data']; // ساختار: [material_name][delivery_day] = quantity

    foreach ($data as $material => $days) {
        foreach ($days as $date => $quantity) {
            $date = substr($date, 0, 10); // اطمینان از فرمت YYYY-MM-DD
            $quantity = intval($quantity);

            // اگر مقدار خالی/صفر باشد، حذف رکورد
            if ($quantity === 0) {
                $stmt = $pdo->prepare('DELETE FROM schedules WHERE workshop_id = ? AND material_name = ? AND delivery_day = ?');
                $stmt->execute([$workshop_id, $material, $date]);
                continue;
            }

            // اگر رکورد وجود دارد: آپدیت کن، اگر نه: درج کن
            $stmt = $pdo->prepare(
                'SELECT id FROM schedules WHERE workshop_id = ? AND material_name = ? AND delivery_day = ?'
            );
            $stmt->execute([$workshop_id, $material, $date]);
            if ($stmt->fetch()) {
                $stmt = $pdo->prepare('UPDATE schedules SET quantity = ? WHERE workshop_id = ? AND material_name = ? AND delivery_day = ?');
                $stmt->execute([$quantity, $workshop_id, $material, $date]);
            } else {
                $stmt = $pdo->prepare('INSERT INTO schedules (workshop_id, material_name, delivery_day, quantity) VALUES (?, ?, ?, ?)');
                $stmt->execute([$workshop_id, $material, $date, $quantity]);
            }
        }
    }

    echo json_encode(['status' => 'success']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // خواندن داده‌های DELETE به‌صورت JSON
    $input = json_decode(file_get_contents("php://input"), true);

    // بررسی اینکه داده‌های ضروری وجود داشته باشند
    if (!isset($input['workshop_id']) || !isset($input['material_name'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing data.']);
        exit;
    }

    $workshop_id = intval($input['workshop_id']);
    $material_name = $input['material_name'];

    // حذف ماده اولیه از پایگاه داده
    $stmt = $pdo->prepare('DELETE FROM schedules WHERE workshop_id = ? AND material_name = ?');
    $stmt->execute([$workshop_id, $material_name]);

    echo json_encode(['status' => 'success', 'message' => 'Material deleted successfully.']);
    exit;
}



?>
