-- Fix signup provisioning trigger to avoid varchar overflow and ensure row-level security writes succeed

DROP POLICY IF EXISTS "user_select_self_or_admin" ON public."user";
DROP POLICY IF EXISTS "user_update_admin" ON public."user";
DROP POLICY IF EXISTS "rights_no_superadmin_modify_select" ON public.usermodule_rights;
DROP POLICY IF EXISTS "rights_no_superadmin_modify_insert" ON public.usermodule_rights;
DROP POLICY IF EXISTS "rights_no_superadmin_modify_update" ON public.usermodule_rights;

DROP POLICY IF EXISTS "product_select" ON product;
DROP POLICY IF EXISTS "product_insert" ON product;
DROP POLICY IF EXISTS "product_update_edit" ON product;
DROP POLICY IF EXISTS "product_update_delete" ON product;
DROP POLICY IF EXISTS "product_update_recover" ON product;
DROP POLICY IF EXISTS "priceHist_select_active_or_admin" ON priceHist;
DROP POLICY IF EXISTS "salesDetail_select_active_products_or_admin" ON salesDetail;

DROP VIEW IF EXISTS current_product_price;

ALTER TABLE public."user" ALTER COLUMN userId TYPE VARCHAR(255);
ALTER TABLE public."user" ALTER COLUMN username TYPE VARCHAR(50);
ALTER TABLE public."user" ALTER COLUMN lastName TYPE VARCHAR(50);
ALTER TABLE public."user" ALTER COLUMN firstName TYPE VARCHAR(50);
ALTER TABLE public."user" ALTER COLUMN user_type TYPE VARCHAR(20);
ALTER TABLE public."user" ALTER COLUMN record_status TYPE VARCHAR(10);
ALTER TABLE public."user" ALTER COLUMN stamp TYPE VARCHAR(60);

ALTER TABLE public.user_module ALTER COLUMN userid TYPE VARCHAR(255);
ALTER TABLE public.user_module ALTER COLUMN Module_ID TYPE VARCHAR(30);
ALTER TABLE public.user_module ALTER COLUMN record_status TYPE VARCHAR(10);
ALTER TABLE public.user_module ALTER COLUMN stamp TYPE VARCHAR(60);

ALTER TABLE public.usermodule_rights ALTER COLUMN userid TYPE VARCHAR(255);
ALTER TABLE public.usermodule_rights ALTER COLUMN Right_ID TYPE VARCHAR(30);
ALTER TABLE public.usermodule_rights ALTER COLUMN Record_status TYPE VARCHAR(10);
ALTER TABLE public.usermodule_rights ALTER COLUMN Stamp TYPE VARCHAR(60);

CREATE OR REPLACE FUNCTION public.provision_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_username TEXT;
  v_lastname TEXT;
  v_firstname TEXT;
  v_fullname TEXT;
BEGIN
  -- Allow this trigger to write to protected tables even when RLS is enabled.
  SET LOCAL row_security = off;

  v_fullname := NEW.raw_user_meta_data->>'full_name';
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    v_fullname,
    split_part(NEW.email, '@', 1)
  );

  v_lastname := COALESCE(NEW.raw_user_meta_data->>'lastName', '');
  v_firstname := COALESCE(NEW.raw_user_meta_data->>'firstName', v_username);

  v_username := left(v_username, 50);
  v_lastname := left(v_lastname, 50);
  v_firstname := left(v_firstname, 50);

  INSERT INTO public."user" (userId, username, lastName, firstName, user_type, record_status, stamp)
  VALUES (
    NEW.id::text,
    v_username,
    v_lastname,
    v_firstname,
    'USER',
    'INACTIVE',
    LEFT('REGISTERED ' || NEW.id::text || ' ' || NOW()::text, 60)
  )
  ON CONFLICT (userId) DO NOTHING;

  INSERT INTO user_module (userid, Module_ID, rights_value, record_status, stamp)
  VALUES
    (NEW.id::text, 'Prod_Mod',   1, 'ACTIVE', 'AUTO'),
    (NEW.id::text, 'Report_Mod', 1, 'ACTIVE', 'AUTO'),
    (NEW.id::text, 'Adm_Mod',    0, 'ACTIVE', 'AUTO')
  ON CONFLICT (userid, Module_ID) DO NOTHING;

  INSERT INTO public.usermodule_rights (userid, Right_ID, Right_value, Record_status, Stamp)
  VALUES
    (NEW.id::text, 'PRD_ADD',  1, 'ACTIVE', 'AUTO'),
    (NEW.id::text, 'PRD_EDIT', 1, 'ACTIVE', 'AUTO'),
    (NEW.id::text, 'PRD_DEL',  0, 'ACTIVE', 'AUTO'),
    (NEW.id::text, 'REP_001',  1, 'ACTIVE', 'AUTO'),
    (NEW.id::text, 'REP_002',  0, 'ACTIVE', 'AUTO'),
    (NEW.id::text, 'ADM_USER', 0, 'ACTIVE', 'AUTO')
  ON CONFLICT (userid, Right_ID) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.provision_new_user();

CREATE POLICY "user_select_self_or_admin" ON public."user" FOR SELECT
USING (
  userId = auth.uid()::text
  OR (SELECT user_type FROM public."user" WHERE userId = auth.uid()::text) IN ('ADMIN','SUPERADMIN')
);

CREATE POLICY "user_update_admin" ON public."user" FOR UPDATE
USING (
  user_type != 'SUPERADMIN'
  AND (SELECT user_type FROM public."user" WHERE userId = auth.uid()::text) IN ('ADMIN','SUPERADMIN')
);

CREATE POLICY "product_select" ON product FOR SELECT
USING (
  record_status = 'ACTIVE'
  OR (SELECT user_type FROM public."user" WHERE userId = auth.uid()::text) IN ('ADMIN','SUPERADMIN')
);

CREATE POLICY "product_insert" ON product FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.usermodule_rights
    WHERE userid = auth.uid()::text AND Right_ID = 'PRD_ADD' AND Right_value = 1)
);

CREATE POLICY "product_update_edit" ON product FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.usermodule_rights
    WHERE userid = auth.uid()::text AND Right_ID = 'PRD_EDIT' AND Right_value = 1)
);

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

CREATE POLICY "product_update_recover" ON product
FOR UPDATE
USING (
  (SELECT user_type FROM public."user" WHERE userId = auth.uid()::text) IN ('ADMIN','SUPERADMIN')
)
WITH CHECK (record_status = 'ACTIVE');

CREATE POLICY "priceHist_select_active_or_admin" ON priceHist
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM product p
    WHERE p.prodCode = priceHist.prodCode
      AND p.record_status = 'ACTIVE'
  )
  OR (
    SELECT user_type FROM public."user" WHERE userId = auth.uid()::text
  ) IN ('ADMIN','SUPERADMIN')
);

CREATE POLICY "salesDetail_select_active_products_or_admin" ON salesDetail
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM product p
    WHERE p.prodCode = salesDetail.prodCode
      AND p.record_status = 'ACTIVE'
  )
  OR (
    SELECT user_type FROM public."user" WHERE userId = auth.uid()::text
  ) IN ('ADMIN','SUPERADMIN')
);

CREATE OR REPLACE VIEW current_product_price AS
SELECT p.prodCode,
       p.description,
       p.unit,
       p.record_status,
       ph.unitPrice,
       ph.effDate,
       CASE
         WHEN (SELECT user_type FROM public."user" WHERE userId = auth.uid()::text) IN ('ADMIN','SUPERADMIN')
         THEN p.stamp
         ELSE NULL
       END AS stamp
FROM product p
LEFT JOIN priceHist ph ON ph.prodCode = p.prodCode
  AND ph.effDate = (
    SELECT MAX(effDate) FROM priceHist WHERE prodCode = p.prodCode
  );
