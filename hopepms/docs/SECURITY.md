# HopePMS — Security & Compliance Rules

## ABSOLUTE RULES (NON-NEGOTIABLE)

### Rule 1: NO Hard Deletes
**Requirement**: The `DELETE` SQL keyword must NEVER appear in any application code, Supabase function, trigger, or migration file.

**Implementation**:
- All removals use soft-delete: `UPDATE ... SET record_status = 'INACTIVE'`
- `softDeleteProduct(prodCode)` and `deactivateUser(userId)` use UPDATE
- `recoverProduct()` sets `record_status = 'ACTIVE'`

**Verification**:
```bash
grep -r "DELETE FROM" src/
grep -r "\.delete(" src/
# Both should return 0 results (only comments)
```

---

### Rule 2: USER Accounts Never See INACTIVE Records
**Requirement**: Any query, list, or search result for USER type must always filter `WHERE record_status = 'ACTIVE'`.

**Implementation**:
- Frontend: `getProductsWithPrice()` queries active records only
- RLS Policy: `product_select` enforces USER visibility at database level
- DeletedItemsPage: Route blocked for USER accounts (NavigateToProducts)

**Code Location**: 
- `src/services/productService.js:getProductsWithPrice()`
- `db/migrations/004_rls_product.sql:product_select` policy

---

### Rule 3: Only ADMIN & SUPERADMIN See INACTIVE
**Requirement**: Only users with `user_type IN ('ADMIN','SUPERADMIN')` can view INACTIVE records and recover them.

**Implementation**:
- `getInactiveProducts()` called only from DeletedItemsPage
- DeletedItemsPage checks: `if (user_type !== 'ADMIN' && user_type !== 'SUPERADMIN') navigate('/products')`
- RLS policy allows ADMIN/SUPERADMIN to see all records

---

### Rule 4: SUPERADMIN Protection
**Requirement**: No user — not even another SUPERADMIN — can modify a SUPERADMIN account's `user_type`, `record_status`, or rights rows through the UI. This must also be enforced at the RLS policy level.

**Implementation**:

**Frontend Protection** (UserManagementPage.jsx):
```jsx
const isSuperAdmin = user.user_type === 'SUPERADMIN'
if (isSuperAdmin) {
  // All buttons disabled, show tooltip
  <span title="SUPERADMIN accounts cannot be modified">N/A</span>
}
```

**Database Protection** (RLS Policies):
1. `user_update_admin` policy:
   ```sql
   USING (user_type != 'SUPERADMIN' AND ...)
   ```
2. `rights_no_superadmin_modify_*` policies:
   ```sql
   USING (NOT EXISTS (SELECT 1 FROM user WHERE userId = UserModule_Rights.userid AND user_type = 'SUPERADMIN'))
   ```

---

### Rule 5: Stamp Columns Hidden from USER Accounts
**Requirement**: All `stamp` columns are hidden from USER type in all views and SELECT queries.

**Implementation**:
- ProductListPage: `{isAdmin && <th>Stamp</th>}`
- UserManagementPage: `{isSuperAdmin && <td>{stamp}</td>}`
- Views: SQL views include `p.stamp` but frontend filters

**Code Pattern**:
```jsx
const isAdmin = currentUser?.user_type === 'ADMIN' || currentUser?.user_type === 'SUPERADMIN'
if (isAdmin) {
  // Show stamp column
}
```

---

### Rule 6: No .env in Git
**Requirement**: No `.env` files or secrets committed to GitHub. Use `.env.example` with placeholder values.

**Implementation**:
- `.gitignore` blocks all `.env*` files
- `.env.example` provides template with placeholder values
- CI/CD and deployment use environment variable injection

**.gitignore entries**:
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

---

## Authentication & Login Guard

### Email/Password Flow
1. User registers with First Name, Last Name, Username, Email, Password
2. Supabase sends confirmation email
3. On confirmation, `provision_new_user()` trigger creates:
   - `user` row with `USER / INACTIVE`
   - `user_module` rows (all ACTIVE)
   - `UserModule_Rights` rows with default rights
4. Account remains INACTIVE until ADMIN/SUPERADMIN activates

### Google OAuth Flow
1. User clicks "Sign in with Google"
2. Redirects to Supabase OAuth provider
3. Supabase redirects to `/auth/callback`
4. `provision_new_user()` trigger auto-creates USER/INACTIVE account
5. App checks `record_status`:
   - If INACTIVE: `signOut()` + display error message
   - If ACTIVE: Allow login

### Login Guard Code (AuthContext.jsx)
```javascript
const { data: { session } } = await supabase.auth.getSession()
if (session?.user) {
  const isActive = await checkUserIsActive(session.user.id)
  if (!isActive) {
    await supabase.auth.signOut()
    throw new Error('Your account is pending activation. Please contact an administrator.')
  }
}
```

---

## Rights Matrix Enforcement

| Right | SUPERADMIN | ADMIN | USER | RLS Policy |
|---|---|---|---|---|
| PRD_ADD | 1 | 1 | 1 | `product_insert` checks Right_value = 1 |
| PRD_EDIT | 1 | 1 | 1 | `product_update_edit` checks Right_value = 1 |
| PRD_DEL | 1 | 0 | 0 | `product_update_delete` checks Right_value = 1 |
| REP_001 | 1 | 1 | 1 | Frontend gate on `rights?.REP_001 === 1` |
| REP_002 | 1 | 0 | 0 | Frontend gate on `rights?.REP_002 === 1` |
| ADM_USER | 1 | 0 | 0 | Frontend gate on `rights?.ADM_USER === 1` |

### Implementation
1. **Database**: `UserModule_Rights` table stores Right_value (0 or 1)
2. **Frontend**: `UserRightsContext` loads rights map on login
3. **UI Gates**: Components check `rights[RIGHT_ID] === 1`
4. **RLS Gates**: SQL policies validate rights before INSERT/UPDATE

---

## RLS Policies Overview

### product table
- **SELECT**: ACTIVE for USER; all for ADMIN/SUPERADMIN
- **INSERT**: Requires PRD_ADD = 1
- **UPDATE (edit)**: Requires PRD_EDIT = 1
- **UPDATE (soft-delete)**: Requires PRD_DEL = 1
- **UPDATE (recover)**: ADMIN/SUPERADMIN only

### user table
- **UPDATE**: ADMIN can only modify non-SUPERADMIN rows

### UserModule_Rights table
- **ALL**: Cannot modify SUPERADMIN row rights

---

## Stamp Format & Generation

**Format**: `ACTION USERID TIMESTAMP`

**Examples**:
- `ADDED user2 2026-05-13 14:30`
- `UPDATED user1 2026-05-13 09:15`
- `DEACTIVATED user3 2026-05-13 11:00`
- `REGISTERED user5 2026-05-13 10:22`

**Generation** (Client-side before Supabase insert):
```javascript
const now = new Date()
const stamp = `ACTION_NAME ${now.toISOString().replace('T', ' ').split('.')[0]}`
```

---

## User Types

| Type | Capabilities |
|---|---|
| **SUPERADMIN** | Full system access. Seeded at DB setup only. Cannot be modified. |
| **ADMIN** | Product management + user activation. Cannot delete products or modify SUPERADMIN. |
| **USER** | Add/edit products, view REP_001. Cannot delete, access admin functions, or see inactive products. |

---

## Deployment Security Checklist

- [ ] All 6 migrations applied to Supabase in order
- [ ] RLS enabled on all sensitive tables (product, user, UserModule_Rights)
- [ ] Supabase Auth configured for Email + Google OAuth
- [ ] Redirect URLs set for local dev, staging, production
- [ ] Production `.env` uses real Supabase credentials (never committed)
- [ ] SUPERADMIN user seeded directly via SQL (not UI)
- [ ] Test login with inactive user → verify auto-signout
- [ ] Test ADMIN trying to modify SUPERADMIN → verify RLS blocks
- [ ] Test USER accessing `/deleted-items` → verify redirect to `/products`
- [ ] Run `grep -r 'DELETE FROM' src/ db/` → 0 results
- [ ] Enable GitHub branch protection on main and dev (require PR reviews)

---

## Incident Response

### If Hard Delete Found
1. STOP all deployments
2. Check git history: `git log --all --grep="DELETE"`
3. Revert commits
4. Run recovery from backups
5. Post-mortem review

### If SUPERADMIN Modified
1. Check `user` table `stamp` column
2. Verify RLS logs in Supabase
3. Restore from backup
4. Review RLS policies

### If USER Sees INACTIVE Product
1. Check `product_select` RLS policy
2. Verify `record_status` filter in query
3. Check auth context user_type
4. Review logs

---

## Testing & Verification

### Hard Delete Audit
```bash
# Run before each deployment
cd hopepms
grep -r "DELETE FROM" src/ db/ docs/ package.json
grep -r "\.delete(" src/
# Expected output: only comments or component names
```

### Rights Verification (18 Test Cases)
```
SUPERADMIN:
  ✓ PRD_ADD = 1
  ✓ PRD_EDIT = 1
  ✓ PRD_DEL = 1
  ✓ REP_001 = 1
  ✓ REP_002 = 1
  ✓ ADM_USER = 1

ADMIN:
  ✓ PRD_ADD = 1
  ✓ PRD_EDIT = 1
  ✗ PRD_DEL = 0 (button hidden)
  ✓ REP_001 = 1
  ✗ REP_002 = 0 (page blocked)
  ✗ ADM_USER = 0 (page blocked)

USER:
  ✓ PRD_ADD = 1
  ✓ PRD_EDIT = 1
  ✗ PRD_DEL = 0 (button hidden)
  ✓ REP_001 = 1
  ✗ REP_002 = 0 (page blocked)
  ✗ ADM_USER = 0 (page blocked)
```

---

**Last Updated**: May 13, 2026
**Version**: 1.0.0
**Status**: Production Ready
