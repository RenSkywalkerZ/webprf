-- Remove price_multiplier column since we're using fixed prices per competition
ALTER TABLE batches DROP COLUMN IF EXISTS price_multiplier;

-- Update batch data to remove multiplier references
UPDATE batches SET 
  name = 'Batch 1',
  start_date = '2025-07-07',
  end_date = '2025-07-29'
WHERE id = 1;

UPDATE batches SET 
  name = 'Batch 2',
  start_date = '2025-08-01',
  end_date = '2025-08-15'
WHERE id = 2;

UPDATE batches SET 
  name = 'Batch 3',
  start_date = '2025-08-18',
  end_date = '2025-08-27'
WHERE id = 3;
