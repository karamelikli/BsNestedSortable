<?php

$thisPost= $_POST["postArray"];
  sleep(0);
 switch ($_POST["type"]) {
        case 'delete':
           $data = ["message" =>  $thisPost["id"]." id deleted"];
            break;
            case 'edit':
              //  print_r($value);echo "<br>";
                $data = ["message" =>   $thisPost["id"]." id edited"];
                 break;
        default:
            # code...
            break;
    } 
foreach ($thisPost as $key => $value) {
 
    # your code...
 
    
}
echo json_encode($data);


?>
