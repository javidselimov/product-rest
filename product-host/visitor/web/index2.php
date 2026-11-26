<?php

// Get the user's IP address
$user_ip = $_SERVER['HTTP_CLIENT_IP']
    ? $_SERVER['HTTP_CLIENT_IP']
    : ($_SERVER['HTTP_X_FORWARDED_FOR']
        ? $_SERVER['HTTP_X_FORWARDED_FOR']
        : $_SERVER['REMOTE_ADDR']);


// Get the current timestamp
$timestamp = date('Y-m-d H:i:s');

// Log the user's IP address and timestamp to a file
$log_data = "$timestamp - User IP: $user_ip\n";
$log_file = 'user_ip_log_final.txt';

// Append data to the log file
file_put_contents($log_file, $log_data, FILE_APPEND | LOCK_EX);

// Display a message (optional)
echo "User IP logged successfully: $user_ip";


// Provide the PDF file
$pdf_file = '2024_2026_Azerbaijani.pdf';

// Set appropriate headers for a PDF file
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="' . basename($pdf_file) . '"');

// Read and output the PDF file
readfile($pdf_file);


?>