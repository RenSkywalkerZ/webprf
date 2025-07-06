-- Clean up any test/dummy data
DELETE FROM registrations WHERE notes LIKE '%test%' OR notes LIKE '%dummy%';
DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%dummy%' OR email LIKE '%example%';

-- Reset auto-increment counters if needed
SELECT setval('batches_id_seq', (SELECT MAX(id) FROM batches));
