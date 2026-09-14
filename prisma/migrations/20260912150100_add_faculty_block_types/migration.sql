-- Add block types used to compose the faculty page sections
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'faculty_header';
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'faculty_leadership';
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'faculty_directory';