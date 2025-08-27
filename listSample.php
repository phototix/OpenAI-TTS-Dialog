<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$samplesDir = 'samples/';
$jsonFiles = [];

// Check if samples directory exists
if (is_dir($samplesDir)) {
    // Scan directory for JSON files
    $files = scandir($samplesDir);
    
    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'json') {
            $jsonFiles[] = $file;
        }
    }
}

// Return the list of JSON files
echo json_encode($jsonFiles);
?>