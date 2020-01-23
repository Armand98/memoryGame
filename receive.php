<?php

    $requestPayload = file_get_contents("php://input");
    $file = fopen("scores.json", "a") or die("Unable to open file!");
    fwrite($file, $requestPayload);
    fclose($file);
    
?>