-- Create triggers for updated_at columns
CREATE
OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS '
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
' LANGUAGE plpgsql;

-- Create triggers for each table with updated_at
CREATE TRIGGER update_task_statuses_updated_at BEFORE
UPDATE
    ON task_statuses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_priorities_updated_at BEFORE
UPDATE
    ON task_priorities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_types_updated_at BEFORE
UPDATE
    ON task_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE
UPDATE
    ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE
UPDATE
    ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_contents_updated_at BEFORE
UPDATE
    ON task_contents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_acceptance_criteria_updated_at BEFORE
UPDATE
    ON acceptance_criteria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();