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

// Honeypot -- real visitors never fill this hidden field, bots do.
// Pretend success so bots don't learn to leave it empty.
if (trim($data['website'] ?? '') !== '') {
    echo json_encode(['success' => true, 'message' => "Thanks! We'll be in touch soon."]);
    exit;
}

$name          = trim($data['name'] ?? '');
$email         = trim($data['email'] ?? '');
$phone         = trim($data['phone'] ?? '');
$interested_in = trim($data['interested_in'] ?? '');
$course_mode   = trim($data['course_mode'] ?? '');
$message       = trim($data['message'] ?? '');

// Basic server-side validation -- never trust the browser alone
if ($name === '' || $email === '' || $phone === '' || $message === '' ||
    !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid form data']);
    exit;
}

function send_lead_notification($name, $email, $phone, $interested_in, $course_mode, $message) {
    $subject = "New website enquiry from $name";

    $body  = "You have a new enquiry from the FutureX website:\n\n";
    $body .= "Name: $name\n";
    $body .= "Email: $email\n";
    $body .= "Phone: $phone\n";
    $body .= "Interested in: $interested_in\n";
    $body .= "Course mode: $course_mode\n";
    $body .= "Message:\n$message\n";

    // Build the "From" address automatically from whatever domain this
    // script is running on (e.g. futurex.com -> no-reply@futurex.com).
    // No mailbox needs to exist for this -- it's just the sender label.
    $domain    = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $domain    = preg_replace('/^www\./i', '', $domain); // strip leading www.
    $mail_from = 'no-reply@' . $domain;

    $headers   = [];
    $headers[] = "From: " . MAIL_FROM_NAME . " <" . $mail_from . ">";
    // Reply-To is the visitor's own email, so clicking "Reply" in the
    // client's inbox goes straight to the person who filled the form.
    $headers[] = "Reply-To: $email";
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/plain; charset=UTF-8";

    @mail(NOTIFY_EMAIL, $subject, $body, implode("\r\n", $headers));
}

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $stmt = $pdo->prepare(
        "INSERT INTO leads (name, email, phone, interested_in, course_mode, message) VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([$name, $email, $phone, $interested_in, $course_mode, $message]);

    // Email the client a copy of this lead. If mail() fails for any reason
    // (e.g. mailbox not set up yet), we swallow the error -- the lead is
    // already safely saved in the database either way.
    send_lead_notification($name, $email, $phone, $interested_in, $course_mode, $message);

    echo json_encode(['success' => true, 'message' => "Thanks! We'll be in touch soon."]);
} catch (PDOException $e) {
    http_response_code(500);
    // Don't leak DB details to visitors -- log $e->getMessage() somewhere
    // private instead if you want to debug later.
    echo json_encode(['success' => false, 'message' => 'Something went wrong. Please try again.']);
}
