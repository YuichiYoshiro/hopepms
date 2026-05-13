# Sprint 2 - Database & Rights

## Completed Tasks

### Database Schema
- [x] Deploy migration 001: Core tables (product, priceHist, salesDetail, user, Module, rights, etc.)
- [x] Deploy migration 002: Seed data (Modules, Rights, SUPERADMIN user)
- [x] Deploy migration 003: Auto-provisioning trigger for new users
- [x] Deploy migration 004: RLS policies for product table
- [x] Deploy migration 005: RLS policies for user and UserModule_Rights
- [x] Deploy migration 006: SQL views (current_product_price, top_selling_products)

### Rights Management
- [x] Build `UserRightsContext.jsx` — fetches `UserModule_Rights` on login
- [x] Build `useRights()` hook — returns rights map
- [x] Store rights as: `{ PRD_ADD: 1, PRD_EDIT: 1, PRD_DEL: 0, ... }`

### Auto-Provisioning
- [x] New users register → trigger creates `USER / INACTIVE` row
- [x] Auto-assign modules: Prod_Mod, Report_Mod, Adm_Mod
- [x] Auto-assign rights for USER type:
  - PRD_ADD = 1
  - PRD_EDIT = 1
  - PRD_DEL = 0
  - REP_001 = 1
  - REP_002 = 0
  - ADM_USER = 0

## Rights Matrix

| Right | SUPERADMIN | ADMIN | USER |
|---|---|---|---|
| PRD_ADD | 1 | 1 | 1 |
| PRD_EDIT | 1 | 1 | 1 |
| PRD_DEL | 1 | 0 | 0 |
| REP_001 | 1 | 1 | 1 |
| REP_002 | 1 | 0 | 0 |
| ADM_USER | 1 | 0 | 0 |

## SUPERADMIN Protection

RLS policies enforce:
- No user can modify SUPERADMIN account `user_type`, `record_status`
- No user can modify SUPERADMIN's `UserModule_Rights` rows
- Even ADMIN cannot bypass this protection

## Soft-Delete Rule

ALL deletions are soft: `UPDATE ... SET record_status = 'INACTIVE'`
- No hard DELETE statements in code or triggers
- Only ADMIN/SUPERADMIN see INACTIVE records
- USER accounts filtered to ACTIVE only by RLS

## Deployment Checklist

- [ ] Test SUPERADMIN seed: user1 with full rights
- [ ] Test new user auto-provisioning
- [ ] Test RLS: USER cannot see INACTIVE products
- [ ] Test RLS: ADMIN can see INACTIVE products
- [ ] Test RLS: ADMIN cannot modify SUPERADMIN account
- [ ] Verify no hard DELETEs in codebase: `grep -r 'DELETE' db/`
- [ ] Verify soft-delete works: check product status after delete

## Next: Sprint 3 - Product CRUD
