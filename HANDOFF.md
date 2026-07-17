# FutureX Academy — Project Handoff (v5)

**Date:** July 17, 2026
**Status:** Frontend complete with video + auto-loading slideshow, 6 service cards, CSV export. Not yet deployed.

---

## 1. What's new since v4

- Intro video (`assets/video/intro.mp4`) plays once, muted, then hands off to an auto-loading photo slideshow (`assets/images/slideshow-1920x1080-16x9/1.jpg, 2.jpg...`) — no code changes needed to add/remove/reorder slides, just follow the numbering rule in that folder's README.txt
- Service cards expanded from 4 to 6: added **Tally Prime (GST + ERP)** and **MS Office & Office Automation**, each with its own real photo
- "Why FutureX" section switched from photo thumbnails back to simple line icons
- Logo is now an actual image file (`assets/images/logo/logo-mark.png`) instead of a text/CSS mark
- Contact form has a new `course_mode` field, saved to the database alongside the rest
- New `backend/export-leads.php` — lets you download all submissions as a `.csv` (opens in Excel), gated behind the same login as `view-leads.php`

## 2. What's in this folder

| File/Folder | What it is |
|---|---|
| `index.html` / `assets/css/style.css` / `assets/js/main.js` | Site code |
| `assets/video/intro.mp4` | Intro video, plays once first |
| `assets/images/slideshow-1920x1080-16x9/` | Auto-loaded photo slides, numbered 1.jpg upward |
| `assets/images/site-photos/` | The 6 service card photos, fixed filenames |
| `assets/images/logo/logo-mark.png` | Site logo |
| `backend/db-config.php` | **Still has placeholder values — needs your real DB details** |
| `backend/contact-handler.php` | Saves submissions (now incl. course_mode) |
| `backend/view-leads.php` | Password-gated submissions viewer |
| `backend/export-leads.php` | CSV export, requires being logged into view-leads.php first |
| `backend/leads_table.sql` | Creates the table — includes an `ALTER TABLE` line if you already ran the old version without `course_mode` |

## 3. What's NOT done yet

- **Not deployed.** Still needs Hostinger upload.
- **`backend/db-config.php` untouched** — same 4 placeholder values as before.
- **MySQL table not created / not migrated.** If you already ran the old `leads_table.sql`, use the `ALTER TABLE` line at the bottom of the new one to add `course_mode` instead of re-running the whole thing.

## 4. Deploy steps

1. Create/confirm your MySQL database in Hostinger hPanel → Databases.
2. Run `backend/leads_table.sql` in phpMyAdmin (or just the `ALTER TABLE` line if the table already exists).
3. Fill in `backend/db-config.php` with real DB host/name/user/password + a `VIEW_PASSWORD`.
4. Upload everything into `public_html`, keeping the folder structure.
5. Test: submit the live form, check `yourdomain.com/backend/view-leads.php`, try "Export to Excel."
