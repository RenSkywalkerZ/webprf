-- Add reset token fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP WITH TIME ZONE;

-- Create index for reset token lookup
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
