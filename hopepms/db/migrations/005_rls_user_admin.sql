-- RLS Policies for user table and UserModule_Rights

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE UserModule_Rights ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_current_user_admin_or_superadmin()
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

-- user table: USER can read their own row; ADMIN/SUPERADMIN can read all
DROP POLICY IF EXISTS "user_select_self_or_admin" ON public."user";
CREATE POLICY "user_select_self_or_admin" ON public."user" FOR SELECT
USING (
  userId = auth.uid()::text
  OR public.is_current_user_admin_or_superadmin()
);

-- user table: ADMIN can UPDATE record_status only where target is NOT SUPERADMIN
DROP POLICY IF EXISTS "user_update_admin" ON public."user";
CREATE POLICY "user_update_admin" ON public."user" FOR UPDATE
USING (
  user_type != 'SUPERADMIN'
  AND public.is_current_user_admin_or_superadmin()
);

-- UserModule_Rights: ADMIN cannot INSERT/UPDATE/DELETE rows where target userid is SUPERADMIN
DROP POLICY IF EXISTS "rights_no_superadmin_modify_select" ON UserModule_Rights;
CREATE POLICY "rights_no_superadmin_modify_select" ON UserModule_Rights FOR SELECT
USING (
  NOT EXISTS (
    SELECT 1 FROM public."user"
    WHERE userId = UserModule_Rights.userid AND user_type = 'SUPERADMIN'
  )
  OR (SELECT user_type FROM public."user" WHERE userId = auth.uid()::text) = 'SUPERADMIN'
);

DROP POLICY IF EXISTS "rights_no_superadmin_modify_insert" ON UserModule_Rights;
CREATE POLICY "rights_no_superadmin_modify_insert" ON UserModule_Rights FOR INSERT
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public."user"
    WHERE userId = UserModule_Rights.userid AND user_type = 'SUPERADMIN'
  )
);

DROP POLICY IF EXISTS "rights_no_superadmin_modify_update" ON UserModule_Rights;
CREATE POLICY "rights_no_superadmin_modify_update" ON UserModule_Rights FOR UPDATE
USING (
  NOT EXISTS (
    SELECT 1 FROM public."user"
    WHERE userId = UserModule_Rights.userid AND user_type = 'SUPERADMIN'
  )
);


