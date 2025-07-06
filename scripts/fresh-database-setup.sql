-- Fresh Supabase Database Setup for Physics Olympiad Website
-- Run this script if you need to set up a clean database

-- Drop existing tables if they exist (BE CAREFUL - THIS WILL DELETE ALL DATA)
-- Uncomment the following lines only if you want to start completely fresh
-- DROP TABLE IF EXISTS registrations CASCADE;
-- DROP TABLE IF EXISTS pricing CASCADE;
-- DROP TABLE IF EXISTS batches CASCADE;
-- DROP TABLE IF EXISTS competitions CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS system_settings CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(255),
    phone VARCHAR(50),
    address JSONB,
    date_of_birth DATE,
    school VARCHAR(255),
    grade VARCHAR(100),
    education_level VARCHAR(50),
    gender VARCHAR(20),
    student_id VARCHAR(100),
    identity_type VARCHAR(50), -- This is the critical field for identity type persistence
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create competitions table
CREATE TABLE IF NOT EXISTS competitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    base_fee DECIMAL(10,2) DEFAULT 0,
    max_participants INTEGER,
    participants_count INTEGER DEFAULT 0,
    color VARCHAR(50) DEFAULT '#3B82F6',
    icon VARCHAR(100) DEFAULT 'trophy',
    form_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create batches table
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    price_multiplier DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create pricing table
CREATE TABLE IF NOT EXISTS pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, competition_id)
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    batch_number INTEGER REFERENCES batches(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_proof TEXT,
    notes TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, competition_id)
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_identity_type ON users(identity_type);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_competition_id ON registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_pricing_batch_competition ON pricing(batch_id, competition_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_competitions_updated_at ON competitions;
CREATE TRIGGER update_competitions_updated_at 
    BEFORE UPDATE ON competitions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at 
    BEFORE UPDATE ON registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
('current_batch_id', '1', 'Currently active batch ID')
ON CONFLICT (key) DO NOTHING;

-- Insert sample batch
INSERT INTO batches (name, start_date, end_date, price_multiplier, is_active) VALUES
('Batch 1 - Early Bird', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 0.8, true)
ON CONFLICT DO NOTHING;

-- Insert sample competitions
INSERT INTO competitions (title, description, category, base_fee, color, icon) VALUES
('Fisika SMP', 'Kompetisi Fisika untuk tingkat SMP', 'SMP', 50000, '#3B82F6', 'atom'),
('Fisika SMA', 'Kompetisi Fisika untuk tingkat SMA', 'SMA', 75000, '#10B981', 'zap'),
('Matematika SMP', 'Kompetisi Matematika untuk tingkat SMP', 'SMP', 45000, '#F59E0B', 'calculator'),
('Matematika SMA', 'Kompetisi Matematika untuk tingkat SMA', 'SMA', 70000, '#EF4444', 'sigma'),
('Kimia SMA', 'Kompetisi Kimia untuk tingkat SMA', 'SMA', 65000, '#8B5CF6', 'flask-conical'),
('Biologi SMA', 'Kompetisi Biologi untuk tingkat SMA', 'SMA', 60000, '#06B6D4', 'microscope'),
('Astronomi SMA', 'Kompetisi Astronomi untuk tingkat SMA', 'SMA', 80000, '#F97316', 'telescope'),
('Komputer SMA', 'Kompetisi Ilmu Komputer untuk tingkat SMA', 'SMA', 85000, '#84CC16', 'laptop')
ON CONFLICT DO NOTHING;

-- Create admin user (you should change this email and create the user through your auth system)
INSERT INTO users (email, full_name, role) VALUES
('admin@prfxiii.com', 'Administrator PRF XIII', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Verify the setup
SELECT 'Users table' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Competitions table', COUNT(*) FROM competitions
UNION ALL
SELECT 'Batches table', COUNT(*) FROM batches
UNION ALL
SELECT 'System Settings table', COUNT(*) FROM system_settings;

-- Show the users table structure to verify identity_type column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;
