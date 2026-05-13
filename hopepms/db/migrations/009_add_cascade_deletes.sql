-- Add CASCADE delete behavior to foreign key constraints
-- Allows deleting users and automatically removes related records

-- Drop existing foreign key constraints
ALTER TABLE user_module DROP CONSTRAINT IF EXISTS user_module_userid_fkey;
ALTER TABLE UserModule_Rights DROP CONSTRAINT IF EXISTS usermodule_rights_userid_fkey;

-- Recreate constraints with CASCADE delete
ALTER TABLE user_module
ADD CONSTRAINT user_module_userid_fkey
FOREIGN KEY (userid) REFERENCES "user"(userId) ON DELETE CASCADE;

ALTER TABLE UserModule_Rights
ADD CONSTRAINT usermodule_rights_userid_fkey
FOREIGN KEY (userid) REFERENCES "user"(userId) ON DELETE CASCADE;

-- Also add CASCADE for module relationships (optional but good practice)
ALTER TABLE user_module DROP CONSTRAINT IF EXISTS user_module_Module_ID_fkey;
ALTER TABLE rights DROP CONSTRAINT IF EXISTS rights_Module_ID_fkey;
ALTER TABLE UserModule_Rights DROP CONSTRAINT IF EXISTS usermodule_rights_Right_ID_fkey;

ALTER TABLE user_module
ADD CONSTRAINT user_module_Module_ID_fkey
FOREIGN KEY (Module_ID) REFERENCES "Module"(Module_ID) ON DELETE CASCADE;

ALTER TABLE rights
ADD CONSTRAINT rights_Module_ID_fkey
FOREIGN KEY (Module_ID) REFERENCES "Module"(Module_ID) ON DELETE CASCADE;

ALTER TABLE UserModule_Rights
ADD CONSTRAINT usermodule_rights_Right_ID_fkey
FOREIGN KEY (Right_ID) REFERENCES rights(Right_ID) ON DELETE CASCADE;