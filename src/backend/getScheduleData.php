<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'workshop_management';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// تاریخ 7 روز جاری را به دست می‌آوریم
$today = date('Y-m-d');
$dates = [];
for ($i = 0; $i < 7; $i++) {
    $dates[] = date('Y-m-d', strtotime("$today +$i day"));
}

// گرفتن همه کارگاه‌ها
$workshops = [];
$sql = "SELECT id, workshop_name FROM workshops";
$res = $conn->query($sql);
while ($row = $res->fetch_assoc()) {
    $workshops[] = $row;
}

// گرفتن همه schedule های 7 روز جاری برای این کارگاه‌ها
$workshop_ids = array_column($workshops, 'id');
$placeholders = rtrim(str_repeat('?,', count($workshop_ids)), ',');
$date_placeholders = rtrim(str_repeat('?,', count($dates)), ',');

$type_str = str_repeat('i', count($workshop_ids)) . str_repeat('s', count($dates));
$params = array_merge($workshop_ids, $dates);

// آماده سازی statement
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

$schedules = [];
while ($row = $result->fetch_assoc()) {
    // هر schedule را بر اساس کارگاه و تاریخ ایندکس می‌کنیم
    $wid = $row['workshop_id'];
    $date = $row['delivery_day'];
    if (!isset($schedules[$wid])) $schedules[$wid] = [];
    if (!isset($schedules[$wid][$date])) $schedules[$wid][$date] = [];
    $schedules[$wid][$date][] = [
        "material_name" => $row['material_name'],
        "quantity" => $row['quantity']
    ];
}

echo json_encode([
    "dates" => $dates,
    "workshops" => $workshops,
    "schedules" => $schedules
]);
$conn->close();
?>
