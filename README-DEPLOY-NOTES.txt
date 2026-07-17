FutureX — Bug-fixed build, ready to upload
============================================

What was fixed vs. what's live on Hostinger right now:

1. assets/js/main.js
   The version currently live on your server is OUT OF DATE — it was
   missing the "phone" field in the payload sent to contact-handler.php.
   That's why every form submission returned 400 "Invalid form data"
   even when the phone field was filled in on-screen. THIS COPY has the
   fix already (phone field included). Just overwrite the old file.

2. backend/db-config.php
   VIEW_PASSWORD changed from the placeholder 'change-this-password'
   to 'futurex123'. Use this to log into /backend/view-leads.php.
   DB_HOST / DB_NAME / DB_USER / DB_PASS are unchanged from what you
   gave me — DOUBLE CHECK these still match what's actually set in
   Hostinger's Databases panel, since your Activity Log showed the DB
   password was changed on 2026-07-17. If it was changed AFTER this
   value, update DB_PASS here before uploading.

3. backend/contact-handler.php
   No changes needed — the field names already matched main.js
   correctly. The 400 error was caused entirely by the stale main.js
   on the server (see #1), not this file.

UPLOAD STEPS
------------
1. Upload the entire contents of this folder into public_html on
   Hostinger, overwriting everything (keep the same folder structure).
2. Purge Hostinger's Cache Manager (Advanced -> Cache Manager) for this site.
3. In phpMyAdmin, run backend/leads_table.sql if you haven't already
   (or just the ALTER TABLE lines at the bottom if the table already exists).
4. Hard-refresh the site (Ctrl+Shift+R) or test in an Incognito window,
   so you're not testing a browser-cached copy of the old main.js.
5. Submit the contact form -> should now succeed.
6. Visit yourdomain.com/backend/view-leads.php, log in with futurex123,
   confirm the submission appears.
