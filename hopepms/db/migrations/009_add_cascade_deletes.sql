-- Add CASCADE delete behavior to foreign key constraints
-- Allows deleting users and automatically removes related records

-- Method 1: Drop and recreate all user-related foreign key constraints with CASCADE
-- This handles any constraint name variations

DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Drop all foreign key constraints that reference the user table
    FOR constraint_record IN
        SELECT conname, conrelid::regclass AS table_name
        FROM pg_constraint
        WHERE confrelid = '"user"'::regclass
          AND contype = 'f'
    LOOP
        EXECUTE 'ALTER TABLE ' || constraint_record.table_name || ' DROP CONSTRAINT IF EXISTS ' || constraint_record.conname;
        RAISE NOTICE 'Dropped constraint: % from table %', constraint_record.conname, constraint_record.table_name;
    END LOOP;

    -- Recreate constraints with CASCADE delete
    ALTER TABLE user_module
    ADD CONSTRAINT user_module_userid_fkey
    FOREIGN KEY (userid) REFERENCES "user"(userId) ON DELETE CASCADE;

    ALTER TABLE UserModule_Rights
    ADD CONSTRAINT usermodule_rights_userid_fkey
    FOREIGN KEY (userid) REFERENCES "user"(userId) ON DELETE CASCADE;

    -- Also handle module and rights relationships
    ALTER TABLE user_module
    ADD CONSTRAINT user_module_Module_ID_fkey
    FOREIGN KEY (Module_ID) REFERENCES "Module"(Module_ID) ON DELETE CASCADE;

    ALTER TABLE rights
    ADD CONSTRAINT rights_Module_ID_fkey
    FOREIGN KEY (Module_ID) REFERENCES "Module"(Module_ID) ON DELETE CASCADE;

    ALTER TABLE UserModule_Rights
    ADD CONSTRAINT usermodule_rights_Right_ID_fkey
    FOREIGN KEY (Right_ID) REFERENCES rights(Right_ID) ON DELETE CASCADE;

END $$;