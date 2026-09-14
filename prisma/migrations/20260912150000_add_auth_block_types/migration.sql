-- Add block types used to compose the sign-in page as editable sections
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'auth_visual';
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'auth_intro';
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'auth_form';
ALTER TYPE "BlockType" ADD VALUE IF NOT EXISTS 'auth_contact';