ALTER TABLE tasks 
ADD COLUMN task_content JSONB,
ADD COLUMN relationships JSONB,
ADD COLUMN metadata JSONB,
ADD COLUMN progress JSONB; 