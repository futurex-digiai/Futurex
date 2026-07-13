# FutureX — Ready-to-upload folder

This folder is laid out EXACTLY as it should appear in Hostinger's
public_html. Upload the entire contents of this folder (not the folder
itself) into public_html, keeping the same structure:

public_html/
├── index.html
├── assets/
│   ├── css/style.css
│   └── js/main.js          (already updated to submit to backend/contact-handler.php)
└── backend/
    ├── db-config.php       (fill in your real DB details before uploading)
    ├── contact-handler.php (saves form submissions to MySQL)
    ├── view-leads.php      (password-protected page to view submissions)
    └── leads_table.sql     (run this in phpMyAdmin, NOT uploaded to a folder)

## Before uploading

1. Create a MySQL database in hPanel -> Databases -> MySQL Databases.
2. Open phpMyAdmin for that database, go to the SQL tab, paste the
   contents of backend/leads_table.sql, click Go.
3. Open backend/db-config.php and fill in your real DB_HOST, DB_NAME,
   DB_USER, DB_PASS, and set VIEW_PASSWORD to your own password.

## After uploading

- Site: https://yourdomain.com
- Client's submissions view: https://yourdomain.com/backend/view-leads.php
  (protected by the VIEW_PASSWORD you set)

## Note

backend/db-config.php contains your real database password once filled
in. It's safe on the server (PHP runs server-side, visitors never see the
code) but don't share this file or commit it to a public git repo.
