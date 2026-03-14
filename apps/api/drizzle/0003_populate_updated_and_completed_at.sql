-- Set completed_at for tasks already marked as done
UPDATE "tasks"
SET "completed_at" = "created_at"
WHERE "status" = 'done';

-- Set updated_at to created_at for pending tasks (never modified)
UPDATE "tasks"
SET "updated_at" = "created_at"
WHERE "status" = 'pending';

-- Set updated_at to created_at for in_progress tasks (simulating a modification after creation)
UPDATE "tasks"
SET "updated_at" = "created_at" + INTERVAL '1 day'
WHERE "status" = 'in_progress';