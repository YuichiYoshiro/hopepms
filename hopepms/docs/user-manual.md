# HopePMS User Manual

## System Overview

HopePMS is a role-aware, rights-enforced product management system for Hope, Inc. built on React 18 + Supabase.

### User Types
- **SUPERADMIN**: Full system access. Cannot be modified by anyone. Seeded at setup.
- **ADMIN**: Product/report management. Can activate/deactivate users. Cannot touch SUPERADMIN.
- **USER**: Standard user. Can add/edit products, view reports. Cannot delete or manage users.

---

## Getting Started

### Registration
1. Go to `/register`
2. Enter First Name, Last Name, Username, Email, Password
3. Click "Register"
4. Check your email for confirmation link
5. Account is created as `USER / INACTIVE`
6. Wait for an ADMIN to activate your account

### Google Sign-In
1. Click "Sign in with Google" on login page
2. Authorize HopePMS to access your Google account
3. Account is auto-created as `USER / INACTIVE`
4. Wait for ADMIN activation

### Login
1. Go to `/login`
2. Enter email and password (or sign in with Google)
3. If account is INACTIVE, you'll be logged out immediately
4. Contact an admin to activate your account

---

## Product Management

### View Products
- Navigate to **Products** from the sidebar
- Displays all ACTIVE products in a table
- Columns: Product Code, Description, Unit, Unit Price
- ADMIN/SUPERADMIN also see **Stamp** (creation/edit metadata)

### Add Product (requires PRD_ADD right)
1. Click **Add Product** button
2. Enter:
   - Product Code (up to 6 characters)
   - Description (up to 30 characters)
   - Unit (pc, ea, mtr, pkg, ltr)
   - Unit Price (optional, decimal)
3. Click **Add**
4. Product appears in table immediately

### Edit Product (requires PRD_EDIT right)
1. Click **Edit** button on product row
2. Modify:
   - Description
   - Unit
3. Click **Update**
4. Changes reflected immediately

### Delete Product (requires PRD_DEL right)
1. Click **Delete** button on product row
2. Confirm deletion
3. Product moved to **Deleted Items** (not permanently removed)
4. Remains in database with `record_status = 'INACTIVE'`

---

## Deleted Items (ADMIN/SUPERADMIN only)

### View Deleted Products
1. Navigate to **Deleted Items** from sidebar
2. Table shows all INACTIVE products
3. Columns: Product Code, Description, Stamp, Recover button

### Recover Product
1. Click **Recover** button on product row
2. Product returns to ACTIVE status
3. Reappears in main Products list

---

## Reports

### Product Report (REP_001)
- Navigate to **Product Report (REP_001)** from sidebar
- Access: if `rights.REP_001 = 1` (all user types by default)
- Displays all ACTIVE products with current unit price
- Columns: Code, Description, Unit, Price, Effective Date

### Top Selling Report (REP_002)
- Navigate to **Top Selling (REP_002)** from sidebar
- Access: ADMIN/SUPERADMIN only
- Displays products ranked by total quantity sold
- Columns: Code, Description, Total Qty, Total Revenue

---

## User Management (ADM_USER right)

### Activate/Deactivate Users
1. Navigate to **Admin / Users** from sidebar
2. Table shows all users with status and type
3. For non-SUPERADMIN rows:
   - Click **Activate** to enable account
   - Click **Deactivate** to disable account
4. Changes take effect immediately

### SUPERADMIN Protection
- Rows with `user_type = SUPERADMIN` have **N/A** instead of action buttons
- No admin can modify SUPERADMIN accounts
- Protection enforced at database level (RLS policies)

---

## Understanding Stamps

Stamp columns show metadata about record changes:
- Format: `ACTION USERID YYYY-MM-DD HH:MM`
- Example: `ADDED user2 2026-05-13 14:30`
- Only visible to ADMIN/SUPERADMIN
- USER accounts never see stamps

---

## Rights Matrix

Your access depends on your assigned rights:

| Feature | SUPERADMIN | ADMIN | USER |
|---|---|---|---|
| Add Product | ✓ | ✓ | ✓ |
| Edit Product | ✓ | ✓ | ✓ |
| Delete Product | ✓ | ✗ | ✗ |
| View Product Report | ✓ | ✓ | ✓ |
| View Top Selling | ✓ | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ |

---

## Troubleshooting

### "Your account is pending activation"
- Contact an ADMIN to activate your account
- Wait 24-48 hours and try logging in again

### "You do not have access to this page"
- This feature requires a higher role or specific rights
- Request access from an ADMIN or SUPERADMIN

### Product disappeared after delete
- It's been soft-deleted (moved to Deleted Items)
- ADMIN/SUPERADMIN can recover it
- It's not permanently removed

---

## Data Privacy

- No INACTIVE records are visible to regular users
- User passwords are never shown or stored in plain text
- Supabase handles all authentication securely
- All operations are logged via stamp columns
