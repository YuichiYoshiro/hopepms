-- RLS Policies for product table

ALTER TABLE product ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is ADMIN or SUPERADMIN
DROP FUNCTION IF EXISTS public.is_current_user_admin_or_superadmin() CASCADE;
CREATE FUNCTION public.is_current_user_admin_or_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SET LOCAL row_security = off;
  SELECT EXISTS (
    SELECT 1
    FROM public."user"
    WHERE userId = auth.uid()::text
      AND user_type IN ('ADMIN','SUPERADMIN')
  ) INTO v_is_admin;
  RETURN v_is_admin;
END;
$$;

-- SELECT: USER sees ACTIVE only; ADMIN/SUPERADMIN see all
DROP POLICY IF EXISTS "product_select" ON product;
CREATE POLICY "product_select" ON product FOR SELECT
USING (
  record_status = 'ACTIVE'
  OR public.is_current_user_admin_or_superadmin()
);

-- INSERT: only if PRD_ADD right = 1
DROP POLICY IF EXISTS "product_insert" ON product;
CREATE POLICY "product_insert" ON product FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.usermodule_rights
    WHERE userid = auth.uid()::text AND Right_ID = 'PRD_ADD' AND Right_value = 1)
);

-- UPDATE (edit fields): only if PRD_EDIT right = 1
DROP POLICY IF EXISTS "product_update_edit" ON product;
CREATE POLICY "product_update_edit" ON product FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.usermodule_rights
    WHERE userid = auth.uid()::text AND Right_ID = 'PRD_EDIT' AND Right_value = 1)
);

-- UPDATE (soft-delete to INACTIVE): only if PRD_DEL right = 1
DROP POLICY IF EXISTS "product_update_delete" ON product;
CREATE POLICY "product_update_delete" ON product
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.usermodule_rights
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
  public.is_current_user_admin_or_superadmin()
)
WITH CHECK (record_status = 'ACTIVE');
