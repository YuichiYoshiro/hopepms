# TODO - HopeDB (RLS + Signup Fix)

- [ ] Fix signup trigger varchar overflow (use `DB_USER_PROVISION_FIX.sql`)
- [x] Add SQL correctness fix in `db/migrations/001_initial_schema.sql`
- [ ] Make RLS migrations re-runnable (idempotent policies)
  - created `DB_RLS_IDEMPOTENT_FIX.sql`
- [ ] Re-run 004/005/007 or use the idempotent script only

