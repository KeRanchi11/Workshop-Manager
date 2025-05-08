<?php
// تنظیم هدر‌های مربوط به پاسخ
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// تنظیمات اتصال به پایگاه داده
$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'workshop_management';

$conn = new mysqli($host, $username, $password, $dbname);

// بررسی خطا در اتصال
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// دریافت تاریخ شروع هفته از کلاینت؛ اگر ارسال نشده باشد، تاریخ امروز را تنظیم می‌کند
$weekStart = isset($_GET['weekStart']) ? $_GET['weekStart'] : date('Y-m-d');
$weekStartDate = date_create($weekStart);

// محاسبه تاریخ‌های هفته درخواست‌شده
$dates = [];
for ($i = 0; $i < 7; $i++) {
    $dates[] = date_format($weekStartDate, 'Y-m-d'); // تاریخ‌ها به فرمت مناسب
    date_modify($weekStartDate, '+1 day'); // اضافه شدن یک روز به `weekStart`
}

// گرفتن لیست کارگاه‌ها از جدول `workshops`
$workshops = [];
$sql = "SELECT id, workshop_name FROM workshops";
$res = $conn->query($sql);
while ($row = $res->fetch_assoc()) {
    $workshops[] = $row;
}

// گرفتن داده‌های `schedules` مربوط به تاریخ‌های هفته درخواست‌شده
$workshop_ids = array_column($workshops, 'id'); // استخراج ID کارگاه‌ها
$placeholders = rtrim(str_repeat('?,', count($workshop_ids)), ','); // جای‌گذاری پویا برای کارگاه‌ها
$date_placeholders = rtrim(str_repeat('?,', count($dates)), ',');

$type_str = str_repeat('i', count($workshop_ids)) . str_repeat('s', count($dates)); // تنظیم نوع داده‌های پارامترها
$params = array_merge($workshop_ids, $dates); // ترکیب پارامترها برای ارسال به bind_param

$query = "SELECT s.*, w.workshop_name 
          FROM schedules s 
          JOIN workshops w ON s.workshop_id = w.id
          WHERE s.workshop_id IN ($placeholders) 
          AND s.delivery_day IN ($date_placeholders)";
$stmt = $conn->prepare($query);

// bind_param با تعداد متغیر پویا
$stmt->bind_param($type_str, ...$params);
$stmt->execute();
$result = $stmt->get_result();

// دسته‌بندی داده‌های برگشتی به ساختار مناسب
$schedules = [];
while ($row = $result->fetch_assoc()) {
    $wid = $row['workshop_id'];
    $date = $row['delivery_day'];
    if (!isset($schedules[$wid])) $schedules[$wid] = [];
    if (!isset($schedules[$wid][$date])) $schedules[$wid][$date] = [];
    $schedules[$wid][$date][] = [
        "material_name" => $row['material_name'],
        "quantity" => $row['quantity']
    ];
}

// بازگرداندن داده‌ها به صورت JSON
echo json_encode([
    "dates" => $dates,
    "workshops" => $workshops,
    "schedules" => $schedules
]);
$conn->close();
?>
