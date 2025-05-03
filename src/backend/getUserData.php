<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$host = 'localhost';
$username = 'root';
$password = '';
$dbname = 'workshop_management';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT 
            users.id AS user_id,
            users.username,
            users.phone_number,
            users.role,
            workshops.id AS workshop_id,
            workshops.workshop_name,
            workshops.ceo_name,
            workshops.staff_count,
            workshops.capacity,
            workshops.address,
            workshops.field_of_work
        FROM users
        LEFT JOIN workshops ON users.id = workshops.user_id
        WHERE users.role != 'admin'";

$result = $conn->query($sql);

$data = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

echo json_encode($data);

$conn->close();
?>
