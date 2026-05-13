-- Auto-provisioning trigger for new users
-- Executes when a new user is created via Supabase Auth

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
  -- Ensure the trigger can write to protected tables even when RLS is enabled.
  SET LOCAL row_security = off;

  v_fullname := NEW.raw_user_meta_data->>'full_name';
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    v_fullname,
    split_part(NEW.email, '@', 1)
  );

  -- Match column sizes from 001_initial_schema.sql
  -- public."user" : username varchar(50), lastName varchar(50), firstName varchar(50)
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

  INSERT INTO UserModule_Rights (userid, Right_ID, Right_value, Record_status, Stamp)
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

