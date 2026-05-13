# Sprint 3 - Product CRUD & Reporting

## Completed Tasks

### Product Service
- [x] `getProducts()` — fetch ACTIVE products only
- [x] `getProductsWithPrice()` — join with current_product_price view
- [x] `getInactiveProducts()` — ADMIN/SUPERADMIN only
- [x] `addProduct()` — requires PRD_ADD right, auto-stamp
- [x] `updateProduct()` — requires PRD_EDIT right, auto-stamp
- [x] `softDeleteProduct()` — requires PRD_DEL right, sets record_status='INACTIVE'
- [x] `recoverProduct()` — ADMIN/SUPERADMIN only, resets to ACTIVE

### Product UI Components
- [x] `ProductListPage` — displays ACTIVE products in table
- [x] `AddProductModal` — form to add new product with unit price
- [x] `EditProductModal` — form to edit description and unit
- [x] `DeleteConfirmDialog` — soft-delete confirmation
- [x] Stamp column: hidden for USER, visible for ADMIN/SUPERADMIN
- [x] Action buttons gated by rights (PRD_ADD, PRD_EDIT, PRD_DEL)

### Deleted Items Management
- [x] `DeletedItemsPage` — lists INACTIVE products for ADMIN/SUPERADMIN
- [x] Recover button restores product to ACTIVE
- [x] Route blocked for USER accounts

### Reports
- [x] `ProductReportPage` (REP_001) — list all ACTIVE products with current price
- [x] `TopSellingPage` (REP_002) — aggregated sales by product
- [x] Report views gated by rights (REP_001, REP_002)

### Services
- [x] `productService.js` — product CRUD + soft-delete/recovery
- [x] `priceHistService.js` — price history management
- [x] `reportService.js` — report queries
- [x] `userService.js` — user activation/deactivation

### UI Layout
- [x] `Navbar` — username display, logout button
- [x] `Sidebar` — navigation gated by user_type and rights
  - Products: always
  - Deleted Items: ADMIN/SUPERADMIN only
  - Product Report (REP_001): if right = 1
  - Top Selling (REP_002): if right = 1
  - Admin / Users: if ADM_USER = 1

## Rights Enforcement

| Feature | Guard |
|---|---|
| Add Product button | PRD_ADD = 1 |
| Edit button per row | PRD_EDIT = 1 |
| Delete button per row | PRD_DEL = 1 |
| Deleted Items link | user_type IN ('ADMIN', 'SUPERADMIN') |
| Recover product | ADMIN/SUPERADMIN role |

## Stamp Column Logic

- USER: never see stamp column
- ADMIN/SUPERADMIN: always see stamp
- Format: `'ACTION USERID YYYY-MM-DD HH:MM'`
  - Examples: `'ADDED user2 2026-05-13 14:30'`, `'RECOVERED user1 2026-05-13 15:45'`

## Soft-Delete & Recovery
- Delete: `UPDATE product SET record_status='INACTIVE'` (PRD_DEL required)
- Recovery: `UPDATE product SET record_status='ACTIVE'` (ADMIN/SUPERADMIN only)
- USER never sees INACTIVE rows (RLS enforced)
- ADMIN/SUPERADMIN can view and recover in DeletedItemsPage

## Deployment Checklist

- [ ] Test add product: requires PRD_ADD
- [ ] Test edit product: requires PRD_EDIT
- [ ] Test soft-delete: requires PRD_DEL, not hard delete
- [ ] Test recovery: ADMIN only, product reappears
- [ ] Test stamp visibility: USER hidden, ADMIN visible
- [ ] Test report access: REP_001 and REP_002 rights enforced
- [ ] Verify no hard deletes: `grep -r "\.delete(" src/` returns zero
- [ ] Test RLS bypass: USER calling getProducts() still filtered to ACTIVE

## Next: Sprint 4 - Admin Module & Deploy
