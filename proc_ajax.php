<?php

header("Content-Type: application/json; charset=UTF-8");
$q = $_REQUEST["json"];
$qq = json_decode($q);
date_default_timezone_set("Australia/Sydney");
$IP = $_SERVER['REMOTE_ADDR'];
$date = date("Y-m-d H:i:s");

$code = ($qq->{'code'});
$problemID = ($qq->{'problemID'});
$status = ($qq->{'correctedness'});

$myfile = file_put_contents('ajax_results.txt',$problemID."$%$".$IP."$%$".$date."$%$".$status."$%$".$code."\n", FILE_APPEND | LOCK_EX);

$servername = "localhost";
$username = "root";
$password = "ubuntu";
$dbname = "madmaker";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

// convert correct or incorrect to 1 or 0
if(strcmp($status,'correct')==0){
	$stat = 1;
}
else{
	$stat = 0;
}

// this step is neccessary to store special characters like ' and \
$code = mysqli_real_escape_string($conn,$code);

$sql = "INSERT INTO code18 (IP,problemID,code,status,datetime) VALUES ('$IP','$problemID','$code','$stat','$date')";

if ($conn->query($sql) === TRUE) {
    echo "New record created successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();

?>