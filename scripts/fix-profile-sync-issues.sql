-- Fix Profile Synchronization Issues
-- This script ensures proper database structure and data consistency

-- 1. Ensure all required columns exist with correct data types
DO $$ 
BEGIN
    -- Check and add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'nickname') THEN
        ALTER TABLE users ADD COLUMN nickname TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'education_level') THEN
        ALTER TABLE users ADD COLUMN education_level TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'gender') THEN
        ALTER TABLE users ADD COLUMN gender TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'student_id') THEN
        ALTER TABLE users ADD COLUMN student_id TEXT;
    END IF;
    
    -- Ensure address column is JSONB
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address' AND data_type != 'jsonb') THEN
        -- Convert existing address data to JSONB
        ALTER TABLE users ALTER COLUMN address TYPE JSONB USING 
        CASE 
            WHEN address IS NULL THEN NULL
            WHEN address = '' THEN NULL
            WHEN address::text ~ '^{.*}$' THEN address::jsonb
            ELSE json_build_object('street', address, 'rtRw', '', 'village', '', 'district', '', 'city', '', 'province', '', 'postalCode', '')::jsonb
        END;
    END IF;
    
    -- Ensure updated_at column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Create or update the trigger for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Fix any malformed address data
UPDATE users 
SET address = json_build_object(
    'street', '',
    'rtRw', '',
    'village', '',
    'district', '',
    'city', '',
    'province', '',
    'postalCode', ''
)::jsonb
WHERE address IS NULL OR address::text = '' OR address::text = '{}';

-- 4. Ensure all users have proper default values
UPDATE users 
SET 
    nickname = COALESCE(nickname, ''),
    education_level = COALESCE(education_level, ''),
    gender = COALESCE(gender, ''),
    student_id = COALESCE(student_id, ''),
    updated_at = COALESCE(updated_at, created_at, NOW())
WHERE nickname IS NULL 
   OR education_level IS NULL 
   OR gender IS NULL 
   OR student_id IS NULL 
   OR updated_at IS NULL;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 6. Add constraints for data integrity
DO $$
BEGIN
    -- Ensure role has valid values
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'users_role_check') THEN
        ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));
    END IF;
    
    -- Ensure gender has valid values (if not empty)
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'users_gender_check') THEN
        ALTER TABLE users ADD CONSTRAINT users_gender_check CHECK (gender IN ('', 'laki-laki', 'perempuan'));
    END IF;
END $$;

-- 7. Update any existing records with proper timestamps
UPDATE users 
SET updated_at = created_at 
WHERE updated_at IS NULL AND created_at IS NOT NULL;

-- 8. Verify data integrity
DO $$
DECLARE
    user_count INTEGER;
    malformed_address_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO malformed_address_count FROM users WHERE address IS NULL;
    
    RAISE NOTICE 'Profile sync fix completed:';
    RAISE NOTICE '- Total users: %', user_count;
    RAISE NOTICE '- Users with malformed addresses: %', malformed_address_count;
    
    IF malformed_address_count > 0 THEN
        RAISE WARNING 'Found % users with malformed addresses. These have been fixed with default values.', malformed_address_count;
    END IF;
END $$;
