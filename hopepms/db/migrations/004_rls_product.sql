-- RLS Policies for product table

ALTER TABLE product ENABLE ROW LEVEL SECURITY;

-- SELECT: USER sees ACTIVE only; ADMIN/SUPERADMIN see all
DROP POLICY IF EXISTS "product_select" ON product;
CREATE POLICY "product_select" ON product FOR SELECT
USING (
  record_status = 'ACTIVE'
  OR (SELECT user_type FROM public."user" WHERE userId = auth.uid()::text) IN ('ADMIN','SUPERADMIN')
);

-- INSERT: only if PRD_ADD right = 1
DROP POLICY IF EXISTS "product_insert" ON product;
CREATE POLICY "product_insert" ON product FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM UserModule_Rights
    WHERE userid = auth.uid()::text AND Right_ID = 'PRD_ADD' AND Right_value = 1)
);

-- UPDATE (edit fields): only if PRD_EDIT right = 1
DROP POLICY IF EXISTS "product_update_edit" ON product;
CREATE POLICY "product_update_edit" ON product FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM UserModule_Rights
    WHERE userid = auth.uid()::text AND Right_ID = 'PRD_EDIT' AND Right_value = 1)
);

-- UPDATE (soft-delete to INACTIVE): only if PRD_DEL right = 1
DROP POLICY IF EXISTS "product_update_delete" ON product;
CREATE POLICY "product_update_delete" ON product
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM UserModule_Rights
    WHERE userid = auth.uid()::text
      AND Right_ID = 'PRD_DEL'
      AND Right_value = 1
  )
)
WITH CHECK (record_status = 'INACTIVE');

-- UPDATE (recovery to ACTIVE): only ADMIN or SUPERADMIN
DROP POLICY IF EXISTS "product_update_recover" ON product;
CREATE POLICY "product_update_recover" ON product
FOR UPDATE
USING (
  (SELECT user_type FROM public."user" WHERE userId = auth.uid()::text) IN ('ADMIN','SUPERADMIN')
)
WITH CHECK (record_status = 'ACTIVE');
