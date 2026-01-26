-- Migration: Add conversation_id column to advice_entries table
-- Run this SQL in your SQLite database
-- Add the conversation_id column
ALTER TABLE advice_entries
ADD COLUMN conversation_id VARCHAR(36);
-- Update existing entries with a UUID (each entry gets its own conversation for backwards compatibility)
-- For SQLite, we'll use a simple approach since it doesn't have UUID function
-- Each existing entry will be treated as its own conversation
-- Note: After running this, you may want to update existing entries to group them
-- or simply let them each be their own conversation.