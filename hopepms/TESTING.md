# HopePMS Testing & Validation

## Pre-Launch Testing Checklist

### Phase 1: Authentication & Account Management

#### Email Registration
- [ ] Navigate to `/register`
- [ ] Fill in: First Name, Last Name, Username, Email, Password
- [ ] Click "Register"
- [ ] Confirmation email received within 2 minutes
- [ ] Account created with `record_status = 'INACTIVE'`
- [ ] Attempting to login shows: "Your account is pending activation..."

#### Google OAuth
- [ ] Click "Sign in with Google" on login page
- [ ] Authenticate with Google account
- [ ] Redirected to `/auth/callback`
- [ ] New user row created with `user_type = 'USER'` and `record_status = 'INACTIVE'`
- [ ] Auto-provisioned rights:
  - PRD_ADD = 1, PRD_EDIT = 1, PRD_DEL = 0
  - REP_001 = 1, REP_002 = 0
  - ADM_USER = 0

#### SUPERADMIN Seed
- [ ] SUPERADMIN seed (user1) exists in database
- [ ] User1 has all rights = 1
- [ ] User1 record_status = 'ACTIVE'
- [ ] Email: jcesperanza@neu.edu.ph (or configured)

#### Login Guard
- [ ] ACTIVE user can login and access `/products`
- [ ] INACTIVE user is auto-logged out on login attempt
- [ ] Error message: "Your account is pending activation..."
- [ ] Redirect to `/login` page

---

### Phase 2: Product Management

#### Product CRUD by User Type

**USER Account (default rights):**
- [ ] Can view ACTIVE products
- [ ] Can add product (PRD_ADD = 1)
- [ ] Can edit product (PRD_EDIT = 1)
- [ ] Cannot delete product (PRD_DEL = 0)
- [ ] Cannot see Deleted Items link
- [ ] Cannot access `/deleted-items` directly

**ADMIN Account:**
- [ ] Can view ACTIVE products
- [ ] Can add product
- [ ] Can edit product
- [ ] Can delete product (PRD_DEL = 1)
- [ ] Can see Deleted Items link
- [ ] Can recover deleted products
- [ ] Stamp column is visible

**SUPERADMIN Account:**
- [ ] All ADMIN permissions
- [ ] Cannot be modified by any user (even another SUPERADMIN)

#### Soft-Delete Verification
- [ ] Delete product as ADMIN
- [ ] Product disappears from USER's view (RLS enforced)
- [ ] Product appears in `/deleted-items` for ADMIN
- [ ] Database: `record_status = 'INACTIVE'` (not hard deleted)
- [ ] Stamp shows: `'DEACTIVATED userid YYYY-MM-DD HH:MM'`

#### Recovery
- [ ] ADMIN clicks Recover on deleted product
- [ ] Product returns to ACTIVE status
- [ ] Reappears in USER's product list
- [ ] Stamp updated: `'RECOVERED userid YYYY-MM-DD HH:MM'`

#### Stamp Visibility
- [ ] USER: stamp column NOT visible
- [ ] ADMIN: stamp column visible
- [ ] SUPERADMIN: stamp column visible
- [ ] Stamp format: `'ACTION userid YYYY-MM-DD HH:MM'`

---

### Phase 3: Reports & Access Control

#### Report Access

**REP_001 (Product Report Listing):**
- [ ] USER can access via sidebar (right = 1)
- [ ] ADMIN can access via sidebar (right = 1)
- [ ] SUPERADMIN can access via sidebar (right = 1)
- [ ] Link hidden for user without REP_001 = 1
- [ ] Report shows all ACTIVE products with current prices

**REP_002 (Top Selling Report):**
- [ ] SUPERADMIN can access via sidebar (right = 1)
- [ ] ADMIN cannot access sidebar link (right = 0)
- [ ] USER cannot access sidebar link (right = 0)
- [ ] Direct URL access to `/reports/top-selling` blocked for non-authorized users
- [ ] Report shows products ranked by total quantity sold

#### Sidebar Gating
- [ ] Products: always visible (authenticated)
- [ ] Deleted Items: only ADMIN/SUPERADMIN
- [ ] Product Report: only if REP_001 = 1
- [ ] Top Selling: only if REP_002 = 1
- [ ] Admin / Users: only if ADM_USER = 1

---

### Phase 4: User Management

#### Admin Module Access
- [ ] Only users with ADM_USER = 1 can access
- [ ] USER accounts cannot see sidebar link
- [ ] USER direct URL access blocked

#### User Activation/Deactivation
- [ ] ADMIN can toggle ACTIVE ↔ INACTIVE for USER accounts
- [ ] ADMIN can toggle ACTIVE ↔ INACTIVE for own account
- [ ] ADMIN cannot toggle SUPERADMIN accounts
- [ ] SUPERADMIN row shows "N/A" instead of buttons

#### SUPERADMIN Protection
- [ ] ADMIN clicks action button on SUPERADMIN row → disabled
- [ ] Tooltip shows: "SUPERADMIN accounts cannot be modified"
- [ ] Even if URL-hacked, RLS policy blocks modification
- [ ] Database: UserModule_Rights cannot be updated for SUPERADMIN

#### User Status Display
- [ ] User type color-coded (SUPERADMIN=red, ADMIN=blue, USER=gray)
- [ ] Status color-coded (ACTIVE=green, INACTIVE=yellow)
- [ ] Stamp visible for all admin users

---

### Phase 5: Security & RLS Enforcement

#### RLS Verification (product table)
- [ ] USER calling `getProducts()` → only ACTIVE rows returned
- [ ] ADMIN calling `getProducts()` → ACTIVE + INACTIVE rows
- [ ] Direct database query by USER → RLS blocks INACTIVE rows
- [ ] USER cannot bypass RLS via raw SQL

#### RLS Verification (user table)
- [ ] ADMIN can only update non-SUPERADMIN rows
- [ ] ADMIN cannot update SUPERADMIN user_type or record_status
- [ ] RLS policy enforced at database level

#### RLS Verification (UserModule_Rights)
- [ ] ADMIN cannot modify SUPERADMIN's rights rows
- [ ] RLS policy "rights_no_superadmin_modify" active
- [ ] Even Supabase dashboard enforces protection

#### No Hard Deletes
- [ ] Search codebase: `grep -r "DELETE" src/` → zero results
- [ ] Search codebase: `grep -r "\.delete(" src/` → zero results
- [ ] All product removals use `softDeleteProduct()`
- [ ] All user removals use status toggle (no deletes)

---

### Phase 6: Environmental & Deployment

#### Environment Setup
- [ ] `.env` exists with real Supabase credentials
- [ ] `.env.example` committed with placeholders
- [ ] `.gitignore` includes `.env`
- [ ] No secrets in GitHub history

#### GitHub Setup
- [ ] `main` branch protected (require review + status check)
- [ ] `dev` branch protected (require review)
- [ ] Feature branches follow naming: `feat/`, `fix/`, `db/`, `test/`, `docs/`
- [ ] README.md has setup instructions

#### Vercel/Netlify Deployment
- [ ] Environment variables configured
- [ ] Build succeeds: `npm run build` → `dist/` folder
- [ ] Production URL accessible
- [ ] Google OAuth redirect URL configured
- [ ] Supabase Auth redirect URL updated for production

#### Production Verification
- [ ] Register new account on production
- [ ] Confirmation email sent from production domain
- [ ] Login with Google OAuth works
- [ ] Product CRUD works
- [ ] Admin functions work
- [ ] Browser console clean (no errors)

---

### Phase 7: Performance & UX

#### Load Times
- [ ] ProductListPage loads in <2 seconds
- [ ] DeletedItemsPage loads in <2 seconds
- [ ] Reports load in <3 seconds
- [ ] Modals appear instantly

#### UX Polish
- [ ] Loading states show "Loading..."
- [ ] Error messages display clearly
- [ ] Success actions: modal closes, list refreshes
- [ ] Buttons disabled during submission
- [ ] Form validation shows before submit

#### Browser Compatibility
- [ ] Chrome latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Edge latest
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## Rights Matrix Test Cases

18 test cases (3 user types × 6 rights):

| Right | SUPERADMIN | ADMIN | USER | Status |
|---|---|---|---|---|
| PRD_ADD | ✓ | ✓ | ✓ | [ ] pass |
| PRD_EDIT | ✓ | ✓ | ✓ | [ ] pass |
| PRD_DEL | ✓ | ✗ | ✗ | [ ] pass |
| REP_001 | ✓ | ✓ | ✓ | [ ] pass |
| REP_002 | ✓ | ✗ | ✗ | [ ] pass |
| ADM_USER | ✓ | ✗ | ✗ | [ ] pass |

---

## Known Issues & Workarounds

### Issue: New user provisioning slow
**Cause**: Trigger delay  
**Workaround**: Refresh page after registration

### Issue: Stamp column too wide
**Cause**: Design (intended for inspection)  
**Workaround**: Horizontal scroll or responsive design update

### Issue: Google sign-in fails
**Cause**: Redirect URL not configured in Supabase  
**Workaround**: Configure Auth > URL Configuration > Redirect URLs in Supabase

---

## Sign-Off

- [ ] Sprint 1: Auth & Scaffold (approved: _____)
- [ ] Sprint 2: Database & Rights (approved: _____)
- [ ] Sprint 3: Product CRUD & Reports (approved: _____)
- [ ] Sprint 4: Admin & Deployment (approved: _____)
- [ ] Final QA & Security Audit (approved: _____)
- [ ] Production Go-Live (approved: _____)
