-- Seed tasks for tenant_a
INSERT INTO "tasks" ("title", "status", "tenant_id", "completed_at") VALUES
  ('Setup project structure', 'done', 'tenant_a', now()),
  ('Create authentication module', 'done', 'tenant_a', now()),
  ('Implement task CRUD endpoints', 'in_progress', 'tenant_a', NULL),
  ('Add unit tests', 'pending', 'tenant_a', NULL),
  ('Deploy to production', 'pending', 'tenant_a', NULL);

-- Seed tasks for tenant_b
INSERT INTO "tasks" ("title", "status", "tenant_id", "completed_at") VALUES
  ('Design database schema', 'done', 'tenant_b', now()),
  ('Build user dashboard', 'in_progress', 'tenant_b', NULL),
  ('Integrate payment gateway', 'pending', 'tenant_b', NULL),
  ('Write API documentation', 'pending', 'tenant_b', NULL),
  ('Configure CI/CD pipeline', 'pending', 'tenant_b', NULL);
