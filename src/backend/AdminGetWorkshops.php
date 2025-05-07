<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// اطلاعات اتصال به پایگاه داده
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

try {
    $stmt = $connection->prepare("SELECT id, workshop_name, ceo_name, field_of_work FROM workshops");
    $stmt->execute();
    $workshops = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'workshops' => $workshops]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error fetching workshops: ' . $e->getMessage()]);
}

$connection = null;
?>