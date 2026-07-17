# FutureX Academy — Project Handoff (v6)

**Date:** July 18, 2026
**Status:** Live on Hostinger (gold-wombat-287903.hostingersite.com). Contact form bug fixed. 7 service cards, all with real photos. Slideshow photos updated.

This replaces v5. Read this whole file before making further changes — it explains a bug that cost real debugging time, so the cause is documented in detail below.

---

## 1. What changed since v5

### Fixed: contact form was returning "Invalid form data" (400 error) on every submission
- Root cause: the version of assets/js/main.js that was live on the server was an older build that never sent a phone field to the backend at all — not empty, just missing from the JSON payload entirely. backend/contact-handler.php correctly rejects any submission missing phone, so every single submission failed with a 400 error, regardless of what the visitor typed into the Phone field.
- Fix: re-uploaded the correct main.js (the one in this folder) which includes the phone field in the payload. No PHP changes were needed — contact-handler.php was correct the whole time.
- Lesson for next time: if a form suddenly starts failing after a "fix" that should have worked, check whether the actual file on the server matches what you think you uploaded — use browser DevTools -> Network tab -> click the failing request -> Response tab to see the server's real answer, and check Sources tab to see the actual JS running live. Also purge Hostinger's Cache Manager after every upload, and test in an Incognito window — server-side and browser caching both independently served stale files during this debugging session and cost significant time.

### Fixed: VIEW_PASSWORD was still the placeholder value
- backend/db-config.php had VIEW_PASSWORD set to the literal placeholder string change-this-password, meaning view-leads.php either wasn't properly locked down or wasn't usable.
- Fix: set to futurex123. Change this to something only you know before going fully live — it's currently a simple word, fine for internal testing, not ideal long-term.

### Added: real photos for all 7 service cards + new slideshow photos
- Replaced the 6 existing card photos with your new designs (renamed to match the required filenames automatically — no code changes needed for those 6).
- AutoCAD card: this card already existed in the HTML from a previous version but had never had a real photo — it was showing a placeholder line-icon instead. Swapped it to use your card-autocad-16x10.png, matching the same layout as the other 6 cards.
- Replaced all 4 slideshow photos with your new designs (1.png through 4.png).
- Updated assets/images/site-photos/README.txt — it previously only listed 6 files and referenced .jpg, but the actual files are now .png and there are 7. This was the direct cause of the AutoCAD photo being "in the folder but not documented" — the README simply hadn't been updated when that card was added. Fixed now.

## 2. What's in this folder

| File/Folder | What it is |
|---|---|
| index.html / assets/css/style.css / assets/js/main.js | Site code — main.js fixed, see above |
| assets/video/intro.mp4 | Intro video, plays once first |
| assets/images/slideshow-1920x1080-16x9/ | Auto-loaded photo slides — now 1.png through 4.png |
| assets/images/site-photos/ | 7 service card photos (added AutoCAD), all .png now |
| assets/images/logo/logo-mark.png | Site logo |
| backend/db-config.php | DB credentials + VIEW_PASSWORD now set to futurex123 — verify DB_PASS still matches Hostinger, see warning below |
| backend/contact-handler.php | Saves submissions — unchanged, was never actually broken |
| backend/view-leads.php | Password-gated submissions viewer (futurex123) |
| backend/export-leads.php | CSV export, requires being logged into view-leads.php first |
| backend/leads_table.sql | Table creation SQL, run once in phpMyAdmin if not already done |

## 3. Check this before anything else

Your Hostinger Activity Log showed the database password for u479548469_futurex was changed on 2026-07-17. db-config.php in this folder still has DB_PASS set to Fdx.2026 (the value you originally gave me). Confirm this still matches what's actually set in hPanel -> Databases right now. If it was changed after that, database inserts will silently fail even though the form itself will appear to submit successfully — update DB_PASS in db-config.php before relying on this.

## 4. Deploy steps

1. Upload the entire contents of this folder into public_html on Hostinger, overwriting everything — don't merge selectively, since stale individual files is exactly what caused the phone-field bug above.
2. Confirm backend/db-config.php's DB_PASS matches Hostinger's current database password (see #3 above).
3. In phpMyAdmin, run backend/leads_table.sql if the leads table doesn't already have phone and course_mode columns.
4. Go to hPanel -> Advanced -> Cache Manager -> Purge all.
5. Test in an Incognito window (not your regular browser — it will show stale cached files even after a hard refresh in some cases).
6. Submit a real test entry through the contact form.
7. Visit /backend/view-leads.php, log in with futurex123, confirm the test entry appears.
8. Change VIEW_PASSWORD in db-config.php to something private once you're confident everything else works.

## 5. Known open items

- VIEW_PASSWORD is currently futurex123 — fine for testing, change before treating this as production-secure.
- No formal image compression pass has been done on the new photos — some are 250-380KB each, within the recommended range but worth an image compressor pass later if page load feels slow on mobile.
- Domain is still on the temporary gold-wombat-287903.hostingersite.com Hostinger subdomain — DNS/custom domain connection is a separate task, not covered here.
