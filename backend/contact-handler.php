<?php
// contact-handler.php
// Receives the contact form POST and saves it into MySQL.
// Upload this to public_html alongside index.html.

require __DIR__ . '/db-config.php';

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Read the JSON body sent by main.js
$data = json_decode(file_get_contents('php://input'), true);

$name          = trim($data['name'] ?? '');
$email         = trim($data['email'] ?? '');
$interested_in = trim($data['interested_in'] ?? '');
$course_mode   = trim($data['course_mode'] ?? '');
$message       = trim($data['message'] ?? '');

// Basic server-side validation -- never trust the browser alone
if ($name === '' || $email === '' || $message === '' ||
    !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid form data']);
    exit;
}

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $stmt = $pdo->prepare(
        "INSERT INTO leads (name, email, interested_in, course_mode, message) VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([$name, $email, $interested_in, $course_mode, $message]);

    echo json_encode(['success' => true, 'message' => "Thanks! We'll be in touch soon."]);
} catch (PDOException $e) {
    http_response_code(500);
    // Don't leak DB details to visitors -- log $e->getMessage() somewhere
    // private instead if you want to debug later.
    echo json_encode(['success' => false, 'message' => 'Something went wrong. Please try again.']);
}
