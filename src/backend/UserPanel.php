<?php
// رفع کامل CORS و preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:3000");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json");
    http_response_code(200);
    exit();
}
// باقی headerها برای بقیه درخواست‌ها
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");


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



if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["get_workshop"])) {
    $user_id = intval($_GET["user_id"]);
    $stmt = $pdo->prepare("SELECT * FROM workshops WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $workshop = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(["workshop"=>$workshop]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $user_id = intval($data['user_id']);
    $fields = ["workshop_name","ceo_name","staff_count","capacity","field_of_work","address"];

    // ویرایش یا درج
    if (!empty($data["edit"])) {
        // update
        $sql = "UPDATE workshops SET workshop_name=?, ceo_name=?, staff_count=?, capacity=?, field_of_work=?, address=? WHERE user_id=?";
        $pdo->prepare($sql)->execute([
            $data["workshop_name"],
            $data["ceo_name"],
            $data["staff_count"],
            $data["capacity"],
            $data["field_of_work"],
            $data["address"],
            $user_id
        ]);
    } else {
        // insert
        $sql = "INSERT INTO workshops (user_id, workshop_name, ceo_name, staff_count, capacity, field_of_work, address) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $pdo->prepare($sql)->execute([
            $user_id,
            $data["workshop_name"],
            $data["ceo_name"],
            $data["staff_count"],
            $data["capacity"],
            $data["field_of_work"],
            $data["address"]
        ]);
    }
    // Return updated/created workshop
    $stmt = $pdo->prepare("SELECT * FROM workshops WHERE user_id=?");
    $stmt->execute([$user_id]);
    $workshop = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(["success"=>true, "workshop"=>$workshop]);
    exit;
}

echo json_encode(["success"=>false, "message"=>"درخواست نامعتبر"]);
