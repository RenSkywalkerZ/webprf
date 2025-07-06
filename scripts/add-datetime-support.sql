-- Update batches table to support datetime with timezone
ALTER TABLE batches 
ALTER COLUMN start_date TYPE TIMESTAMP WITH TIME ZONE,
ALTER COLUMN end_date TYPE TIMESTAMP WITH TIME ZONE;

-- Update existing batch data with proper timestamps
UPDATE batches SET 
  start_date = '2025-07-07 00:00:00+07',
  end_date = '2025-07-29 23:59:59+07'
WHERE id = 1;

UPDATE batches SET 
  start_date = '2025-08-01 00:00:00+07',
  end_date = '2025-08-15 23:59:59+07'
WHERE id = 2;

UPDATE batches SET 
  start_date = '2025-08-18 00:00:00+07',
  end_date = '2025-08-27 23:59:59+07'
WHERE id = 3;
