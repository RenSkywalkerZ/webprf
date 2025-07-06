-- Ensure all necessary tables and columns exist for the payment system

-- Check if registrations table exists and has required structure
DO $$ 
BEGIN
    -- Ensure registrations table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'registrations') THEN
        CREATE TABLE registrations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            competition_id TEXT NOT NULL,
            batch_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE,
            payment_proof_url TEXT,
            payment_submitted_at TIMESTAMP WITH TIME ZONE
        );
    END IF;

    -- Add any missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'registrations' AND column_name = 'expires_at') THEN
        ALTER TABLE registrations ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'registrations' AND column_name = 'payment_proof_url') THEN
        ALTER TABLE registrations ADD COLUMN payment_proof_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'registrations' AND column_name = 'payment_submitted_at') THEN
        ALTER TABLE registrations ADD COLUMN payment_submitted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create necessary indexes
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_competition_id ON registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_expires_at ON registrations(expires_at);
CREATE INDEX IF NOT EXISTS idx_registrations_batch_id ON registrations(batch_id);

-- Create unique constraint to prevent duplicate registrations
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_unique_user_competition 
ON registrations(user_id, competition_id) 
WHERE status IN ('pending', 'approved');

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data if tables are empty (for testing)
INSERT INTO competitions (id, title, description, category, color) VALUES
('physics-competition', 'Physics Competition', 'Test your physics knowledge', 'Science', 'from-blue-500 to-cyan-600'),
('chemistry-competition', 'Chemistry Competition', 'Test your chemistry knowledge', 'Science', 'from-green-500 to-emerald-600'),
('mathematics-competition', 'Mathematics Competition', 'Test your math skills', 'Mathematics', 'from-purple-500 to-pink-600')
ON CONFLICT (id) DO NOTHING;

-- Ensure system settings table exists
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set default system settings
INSERT INTO system_settings (key, value) VALUES
('current_batch_id', '1'),
('registration_open', 'true'),
('payment_expiration_minutes', '30')
ON CONFLICT (key) DO NOTHING;
