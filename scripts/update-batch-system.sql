-- Add registration_status column to batches table
ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS registration_status VARCHAR(20) DEFAULT 'open' CHECK (registration_status IN ('open', 'closed', 'upcoming'));

-- Update batches with proper status
UPDATE batches SET registration_status = 'open' WHERE id = 1;
UPDATE batches SET registration_status = 'upcoming' WHERE id = 2;
UPDATE batches SET registration_status = 'upcoming' WHERE id = 3;

-- Add current_batch_id to a settings table for admin control
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert current batch setting
INSERT INTO system_settings (setting_key, setting_value) 
VALUES ('current_batch_id', '1') 
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
