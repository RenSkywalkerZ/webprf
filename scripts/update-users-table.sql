-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS nickname VARCHAR(100),
ADD COLUMN IF NOT EXISTS education_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS student_id VARCHAR(50);

-- Update address column to support JSON structure
-- Note: If address is currently TEXT, you might want to migrate existing data
ALTER TABLE users 
ALTER COLUMN address TYPE JSONB USING address::JSONB;

-- Add check constraints for new fields
ALTER TABLE users 
ADD CONSTRAINT check_gender CHECK (gender IN ('laki-laki', 'perempuan') OR gender IS NULL),
ADD CONSTRAINT check_education_level CHECK (education_level IN ('tk', 'sd', 'smp', 'sma', 'universitas', 'umum') OR education_level IS NULL);

-- Create index for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_users_education_level ON users(education_level);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
