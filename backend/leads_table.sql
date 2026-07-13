-- Run this in Hostinger's phpMyAdmin (hPanel -> Databases -> phpMyAdmin ->
-- select your database -> SQL tab -> paste -> Go)

CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  interested_in VARCHAR(255),
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
