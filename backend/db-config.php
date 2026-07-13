<?php
// db-config.php
// Fill these in with your real Hostinger MySQL details (hPanel -> Databases
// -> MySQL Databases shows all four values). Keep this file OUTSIDE
// public_html if your plan allows it, or at least never link to it from
// your site -- it's loaded by the other PHP files, never visited directly.

define('DB_HOST', 'localhost');           // usually 'localhost' on Hostinger
define('DB_NAME', 'u123456789_leads');    // your database name
define('DB_USER', 'u123456789_admin');    // your database username
define('DB_PASS', 'YOUR_DB_PASSWORD');    // your database password

// Password to view submissions in view-leads.php.
// Change this to something only you and your client know.
define('VIEW_PASSWORD', 'change-this-password');
