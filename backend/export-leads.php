<?php
// export-leads.php
// Downloads all form submissions as a .csv file (opens directly in Excel).
// Upload to public_html/backend/ alongside the other files.
// Protected by the same password/session as view-leads.php --
// you must be logged in on view-leads.php first, then click "Export to Excel".

require __DIR__ . '/db-config.php';
session_start();

// Must already be logged in via view-leads.php
if (empty($_SESSION['leads_authed'])) {
    http_response_code(403);
    exit('Not authorized. Please log in via view-leads.php first.');
}

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $stmt = $pdo->query("SELECT * FROM leads ORDER BY created_at DESC");
    $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    exit('Could not load submissions.');
}

// Force a file download named with today's date
$filename = 'futurex-leads-' . date('Y-m-d') . '.csv';
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');

$out = fopen('php://output', 'w');

// UTF-8 BOM so Excel renders special characters correctly
fprintf($out, "\xEF\xBB\xBF");

// Header row
fputcsv($out, ['Date', 'Name', 'Email', 'Interested In', 'Course Mode', 'Message']);

// Data rows
foreach ($leads as $lead) {
    fputcsv($out, [
        $lead['created_at'],
        $lead['name'],
        $lead['email'],
        $lead['interested_in'] ?? '',
        $lead['course_mode'] ?? '',
        $lead['message'],
    ]);
}

fclose($out);
exit;
