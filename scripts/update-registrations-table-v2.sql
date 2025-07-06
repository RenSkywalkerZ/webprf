-- Add missing columns to registrations table if they don't exist
DO $$ 
BEGIN
    -- Add expires_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'registrations' AND column_name = 'expires_at') THEN
        ALTER TABLE registrations ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add payment_proof_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'registrations' AND column_name = 'payment_proof_url') THEN
        ALTER TABLE registrations ADD COLUMN payment_proof_url TEXT;
    END IF;

    -- Add payment_submitted_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'registrations' AND column_name = 'payment_submitted_at') THEN
        ALTER TABLE registrations ADD COLUMN payment_submitted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create index for better performance on expires_at queries
CREATE INDEX IF NOT EXISTS idx_registrations_expires_at ON registrations(expires_at);
CREATE INDEX IF NOT EXISTS idx_registrations_user_competition ON registrations(user_id, competition_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

-- Update existing pending registrations without expiration to have a default expiration
UPDATE registrations 
SET expires_at = created_at + INTERVAL '30 minutes'
WHERE status = 'pending' 
  AND expires_at IS NULL 
  AND payment_proof_url IS NULL;

COMMENT ON COLUMN registrations.expires_at IS 'When the registration expires if payment is not completed';
COMMENT ON COLUMN registrations.payment_proof_url IS 'URL or filename of the uploaded payment proof';
COMMENT ON COLUMN registrations.payment_submitted_at IS 'When the payment proof was submitted';
