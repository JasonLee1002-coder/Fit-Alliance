-- Add photo_urls column to support multiple food photos per meal
ALTER TABLE fa_meal_records
  ADD COLUMN IF NOT EXISTS photo_urls JSONB DEFAULT '[]'::jsonb;

-- Migrate existing photo_url data into photo_urls array
UPDATE fa_meal_records
SET photo_urls = jsonb_build_array(photo_url)
WHERE photo_url IS NOT NULL AND (photo_urls IS NULL OR photo_urls = '[]'::jsonb);
