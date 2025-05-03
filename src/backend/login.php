<?php
// تنظیم هدرهای CORS برای اجازه دسترسی
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0); // پاسخ به درخواست OPTIONS
}

// اطلاعات اتصال به پایگاه داده
$host = 'localhost';
$dbname = 'workshop_management'; // نام دیتابیس
$username = 'root'; // نام‌کاربری پایگاه داده
$password = ''; // رمز عبور پیش‌فرض (معمولاً خالی)

// برقراری اتصال به پایگاه داده
try {
    $connection = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]));
}

// دریافت داده‌ها از درخواست
$data = json_decode(file_get_contents('php://input'), true);

$username = $data['username'] ?? null;
$password = $data['password'] ?? null;

if (!$username || !$password) {
    die(json_encode(['status' => 'error', 'message' => 'Username and password are required.']));
}

try {
    // بررسی اطلاعات کاربری در دیتابیس
    $query = $connection->prepare("SELECT id, password, role, phone_number FROM users WHERE username = ?");
    $query->execute([$username]);
    $user = $query->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Login successful.',
            'user_id' => $user['id'],
            'role' => $user['role'],
            'phone_number' => $user['phone_number'] // شماره تلفن کاربر در پاسخ
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid username or password.']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to login: ' . $e->getMessage()]);
}
?>
