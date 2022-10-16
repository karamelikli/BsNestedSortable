<?php

$thisPost= $_POST["deletedArray"];
sleep(2);
foreach ($thisPost as $key => $value) {
 
    # your code...
    $data = ["message" =>  $value["idim"]." id deleted"];
}
echo json_encode($data);


?>
