# FutureX Academy — Project Handoff (v4)

**Date:** July 16, 2026
**Status:** Frontend redesign complete. Backend built, not yet deployed (pending Hostinger access).

---

## 1. What's in this folder

| File/Folder | What it is |
|---|---|
| `index.html` | The live website page |
| `assets/css/style.css` | All styling — purple/blue/white theme |
| `assets/js/main.js` | All interactivity — nav, hero slider, form submit, animations |
| `assets/images/` | 9 optimized photos (hero slider + service cards), provided by client |
| `backend/db-config.php` | Database connection settings — **needs your real values filled in** |
| `backend/contact-handler.php` | Saves contact form submissions to MySQL |
| `backend/view-leads.php` | Password-protected page to view submissions (no login system needed) |
| `backend/leads_table.sql` | Run once in phpMyAdmin to create the storage table |
| `futurex-single-file.html` | Everything except images combined into one file, for quick preview only — not for deployment |

## 2. What changed in this version

- Full redesign: white background, purple primary, blue secondary, sharp corners (6–12px radius, no oversized rounding)
- Hero section replaced with a real 5-image slider (client provided images, no intro video was included) — autoplay, fade transition, manual arrows, dot indicators, pauses on hover, lazy-loads all but the first slide
- "What We Do" service cards now use the client's real photos (AI, Digital Marketing, Programming, Graphic Design) blended with a dark gradient overlay for text legibility
- "Why FutureX" benefit cards now carry small photo thumbnails
- Navbar logo simplified — removed the blue icon box, kept clean wordmark only
- Mobile navigation upgraded: animated hamburger↔X icon, larger tap targets (44px+, meets mobile accessibility guidelines), smoother slide-down panel
- All original content, copy, navigation links, form fields, and file names unchanged
- No frameworks, no build step — pure HTML/CSS/JS, ready for Hostinger shared hosting as-is

## 3. What's NOT done yet

- **Not deployed.** Nothing is live — this folder needs to be uploaded to Hostinger's `public_html`.
- **`backend/db-config.php` has placeholder values.** Real DB host/name/user/password and a view password must be filled in before the contact form or `view-leads.php` will work.
- **MySQL table not created yet.** `backend/leads_table.sql` needs to be run once in phpMyAdmin.
- No automated tests, no CI/CD (manual deploy only, as originally scoped).

## 4. Deploy steps (short version — full walkthrough given earlier in chat)

1. Create a MySQL database in Hostinger hPanel → Databases.
2. Run `backend/leads_table.sql` in phpMyAdmin.
3. Fill in the 4 values in `backend/db-config.php`.
4. Upload everything in this folder into `public_html`, keeping the folder structure (`assets/`, `backend/`).
5. Test: submit the live contact form, then check `yourdomain.com/backend/view-leads.php`.

## 5. Known limitations

- Hero slider has no intro video (none was provided) — swap in one of the 5 image slides for a `<video>` element later if the client sends footage.
- Images are compressed to ~80–250KB each for performance; if the client sends higher-res replacements, re-run through an image compressor before uploading.
