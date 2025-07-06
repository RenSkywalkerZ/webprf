-- Function to clean up expired registrations
CREATE OR REPLACE FUNCTION cleanup_expired_registrations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired registrations that don't have payment proof
    DELETE FROM registrations 
    WHERE status = 'pending' 
      AND expires_at < NOW() 
      AND payment_proof_url IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup
    INSERT INTO system_settings (key, value, updated_at)
    VALUES ('last_cleanup_expired_registrations', NOW()::TEXT, NOW())
    ON CONFLICT (key) 
    DO UPDATE SET value = NOW()::TEXT, updated_at = NOW();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Run the cleanup function
SELECT cleanup_expired_registrations() as cleaned_registrations;

-- Create a scheduled cleanup (this would typically be done via cron or similar)
COMMENT ON FUNCTION cleanup_expired_registrations() IS 'Cleans up expired registrations without payment proof';
