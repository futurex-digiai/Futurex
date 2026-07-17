<?php
// db-config.php
// Fill these in with your real Hostinger MySQL details (hPanel -> Databases
// -> MySQL Databases shows all four values). Keep this file OUTSIDE
// public_html if your plan allows it, or at least never link to it from
// your site -- it's loaded by the other PHP files, never visited directly.

define('DB_HOST', 'localhost');           // usually 'localhost' on Hostinger
define('DB_NAME', 'u479548469_futurex');    // your database name
define('DB_USER', 'u479548469_futurexadmin');    // your database username
define('DB_PASS', 'Fdx.2026');    // your database password

// Password to view submissions in view-leads.php.
// Change this to something only you and your client know.
define('VIEW_PASSWORD', 'change-this-password');

// ---- Email notification settings ----
// The address that should receive an email every time someone submits
// the contact form (your client's inbox).
define('NOTIFY_EMAIL', 'join.futurex@gmail.com');

// ---- Gmail SMTP settings ----
// Sends the notification email through Gmail itself (instead of the
// server's local mail() function, which Hostinger often blocks or
// sends to spam). SMTP_USER is the Gmail address that sends the email,
// and SMTP_PASS is a 16-character Gmail "App Password" (NOT the normal
// Gmail login password) -- generate one at myaccount.google.com/apppasswords
// with 2-Step Verification turned on for that Gmail account.
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'join.futurex@gmail.com');
define('SMTP_PASS', 'svph xjyn xwll flhb');
define('MAIL_FROM_NAME', 'FutureX Website');
