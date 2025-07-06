-- Add identity_type column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS identity_type VARCHAR(50);

-- Add comment for documentation
COMMENT ON COLUMN users.identity_type IS 'Type of identity document (ktp, sim, paspor, kk, kartu_pelajar, ktm)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_identity_type ON users(identity_type);

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'identity_type';

-- Show sample of users table structure to verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;
