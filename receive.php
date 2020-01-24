<?php

    $requestPayload = file_get_contents("php://input");
    $file = fopen("scores.json", "w") or die("Unable to open file!");
    fwrite($file, $requestPayload);
    fclose($file);
    
?>