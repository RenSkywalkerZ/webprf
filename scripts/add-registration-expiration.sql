-- Add expires_at column to registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- Create index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_registrations_expires_at ON registrations(expires_at);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

-- Update existing registrations to not have expiration (they're already processed)
UPDATE registrations 
SET expires_at = NULL 
WHERE expires_at IS NULL;
