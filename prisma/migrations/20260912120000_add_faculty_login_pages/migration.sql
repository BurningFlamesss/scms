-- Add manageable website page keys for the faculty directory and login pages
ALTER TYPE "WebsitePageKey" ADD VALUE IF NOT EXISTS 'faculty';
ALTER TYPE "WebsitePageKey" ADD VALUE IF NOT EXISTS 'login';

-- Remove the legacy managed pages; their content blocks cascade
DELETE FROM "website_page" WHERE "key" IN ('homepage', 'about', 'contact', 'other');