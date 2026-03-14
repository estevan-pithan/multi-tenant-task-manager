-- Seed tasks for tenant_a
INSERT INTO "tasks" ("title", "status", "tenant_id") VALUES
  ('Setup project structure', 'done', 'tenant_a'),
  ('Create authentication module', 'done', 'tenant_a'),
  ('Implement task CRUD endpoints', 'in_progress', 'tenant_a'),
  ('Add unit tests', 'pending', 'tenant_a'),
  ('Deploy to production', 'pending', 'tenant_a');

-- Seed tasks for tenant_b
INSERT INTO "tasks" ("title", "status", "tenant_id") VALUES
  ('Design database schema', 'done', 'tenant_b'),
  ('Build user dashboard', 'in_progress', 'tenant_b'),
  ('Integrate payment gateway', 'pending', 'tenant_b'),
  ('Write API documentation', 'pending', 'tenant_b'),
  ('Configure CI/CD pipeline', 'pending', 'tenant_b');