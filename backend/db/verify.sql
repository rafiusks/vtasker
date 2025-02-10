-- Check task exists
SELECT * FROM tasks WHERE id = '98f66c4c-044c-42e9-87df-58a4a1d8bc75';

-- Verify status_ids exist
SELECT * FROM task_statuses WHERE id IN (1,2);

-- Check constraints
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'tasks'::regclass; 