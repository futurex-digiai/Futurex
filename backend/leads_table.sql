-- Run this in Hostinger's phpMyAdmin (hPanel -> Databases -> phpMyAdmin ->
-- select your database -> SQL tab -> paste -> Go)

CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  interested_in VARCHAR(255),
  course_mode VARCHAR(50),
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- If you already created the "leads" table before (without course_mode),
-- run this single line instead to add the new column to it:
-- ALTER TABLE leads ADD COLUMN course_mode VARCHAR(50) AFTER interested_in;

-- If you already created the "leads" table before (without phone),
-- run this single line instead to add the new column to it:
-- ALTER TABLE leads ADD COLUMN phone VARCHAR(30) AFTER email;
