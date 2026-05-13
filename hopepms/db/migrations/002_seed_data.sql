-- Seed data for Modules and Rights

-- Insert Modules
INSERT INTO "Module" (Module_ID, DESCRIPTION, Record_status, Stamp)
VALUES
  ('Prod_Mod', 'Product Module', 'ACTIVE', 'SEEDED 2026-05-13 10:00'),
  ('Report_Mod', 'Report Module', 'ACTIVE', 'SEEDED 2026-05-13 10:00'),
  ('Adm_Mod', 'Admin Module', 'ACTIVE', 'SEEDED 2026-05-13 10:00')
ON CONFLICT DO NOTHING;

-- Insert Rights
INSERT INTO rights (Right_ID, Description, Right_value, Module_ID, Record_status, Stamp)
VALUES
  ('PRD_ADD', 'Product Insertion', 1, 'Prod_Mod', 'ACTIVE', 'SEEDED 2026-05-13 10:00'),
  ('PRD_EDIT', 'Product Edit', 1, 'Prod_Mod', 'ACTIVE', 'SEEDED 2026-05-13 10:00'),
  ('PRD_DEL', 'Product Deletion', 1, 'Prod_Mod', 'ACTIVE', 'SEEDED 2026-05-13 10:00'),
  ('REP_001', 'Product Report Listing', 1, 'Report_Mod', 'ACTIVE', 'SEEDED 2026-05-13 10:00'),
  ('REP_002', 'Product Top Selling', 1, 'Report_Mod', 'ACTIVE', 'SEEDED 2026-05-13 10:00'),
  ('ADM_USER', 'Admin Activate User', 1, 'Adm_Mod', 'ACTIVE', 'SEEDED 2026-05-13 10:00')
ON CONFLICT DO NOTHING;

-- SUPERADMIN seed (insert directly into DB)
INSERT INTO "user" (userId, username, lastName, firstName, user_type, record_status, stamp)
VALUES ('user1', 'Jerry', 'Esperanza', 'Jeremias', 'SUPERADMIN', 'ACTIVE', 'ACTIVATED USER1 2023-10-20 9:42')
ON CONFLICT DO NOTHING;

-- All user_module rows for SUPERADMIN: rights_value = 1
INSERT INTO user_module (userid, Module_ID, rights_value, record_status, stamp)
VALUES
  ('user1', 'Prod_Mod', 1, 'ACTIVE', 'SEEDED 2026-05-13 10:00'),
  ('user1', 'Report_Mod', 1, 'ACTIVE', 'SEEDED 2026-05-13 10:00'),
  ('user1', 'Adm_Mod', 1, 'ACTIVE', 'SEEDED 2026-05-13 10:00')
ON CONFLICT DO NOTHING;

-- All UserModule_Rights rows for SUPERADMIN: Right_value = 1
INSERT INTO UserModule_Rights (userid, Right_ID, Right_value, Record_status, Stamp)
VALUES
  ('user1', 'PRD_ADD', 1, 'ACTIVE', 'SEEDED 2026-05-13 10:00'),
  ('user1', 'PRD_EDIT', 1, 'ACTIVE', 'SEEDED 2026-05-13 10:00'),
  ('user1', 'PRD_DEL', 1, 'ACTIVE', 'SEEDED 2026-05-13 10:00'),
  ('user1', 'REP_001', 1, 'ACTIVE', 'SEEDED 2026-05-13 10:00'),
  ('user1', 'REP_002', 1, 'ACTIVE', 'SEEDED 2026-05-13 10:00'),
  ('user1', 'ADM_USER', 1, 'ACTIVE', 'SEEDED 2026-05-13 10:00')
ON CONFLICT DO NOTHING;
