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
$role = $data['role'] ?? 'user'; // مقدار پیش‌فرض نقش کاربر
$phone = $data['phone'] ?? null; // دریافت شماره تلفن

// اعتبارسنجی اطلاعات ضروری
if (!$username || !$password || !$phone) {
    die(json_encode(['status' => 'error', 'message' => 'Username, password, and phone number are required.']));
}

try {
    // بررسی تکراری بودن نام کاربری یا شماره تلفن
    $checkQuery = $connection->prepare("SELECT id FROM users WHERE username = ? OR phone_number = ?");
    $checkQuery->execute([$username, $phone]);
    if ($checkQuery->fetch()) {
        die(json_encode(['status' => 'error', 'message' => 'Username or phone number already exists.']));
    }

    // رمزنگاری رمز عبور
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // افزودن کاربر به دیتابیس
    $query = $connection->prepare("INSERT INTO users (username, password, role, phone_number) VALUES (?, ?, ?, ?)");
    $query->execute([$username, $hashed_password, $role, $phone]);

    echo json_encode(['status' => 'success', 'message' => 'User registered successfully.']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to register user: ' . $e->getMessage()]);
}
?>
