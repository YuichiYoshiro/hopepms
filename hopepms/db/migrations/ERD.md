# HopePMS Database Schema

## Overview
This directory contains SQL migrations for the HopePMS PostgreSQL database running on Supabase.

## Migration Files

### 001_initial_schema.sql
Creates core tables:
- `product` — product catalog with soft-delete support
- `priceHist` — price history tracking
- `salesDetail` — sales line items
- `user` — user accounts with role management
- `Module` — feature modules
- `user_module` — module assignments per user
- `rights` — individual rights per module
- `UserModule_Rights` — user rights assignments

### 002_seed_data.sql
Seeds initial data:
- Modules: Prod_Mod, Report_Mod, Adm_Mod
- Rights: PRD_ADD, PRD_EDIT, PRD_DEL, REP_001, REP_002, ADM_USER
- SUPERADMIN user (user1) with full rights

### 003_trigger_provision.sql
Auto-provisioning trigger for new users via Supabase Auth:
- Creates `user` row with `USER / INACTIVE` status
- Auto-assigns module access
- Auto-assigns initial rights

### 004_rls_product.sql
Row-Level Security policies for product table:
- SELECT: USER sees ACTIVE only; ADMIN/SUPERADMIN see all
- INSERT: PRD_ADD right = 1
- UPDATE: PRD_EDIT or PRD_DEL rights
- Recovery: ADMIN/SUPERADMIN only

### 005_rls_user_admin.sql
RLS policies for user and rights tables:
- User updates: ADMIN can only modify non-SUPERADMIN rows
- Rights modifications: Cannot modify SUPERADMIN row rights

### 006_views.sql
SQL views for reports:
- `current_product_price` — latest price per product
- `top_selling_products` — aggregated sales by product

## Deployment Order

Apply migrations in order:
1. 001_initial_schema.sql
2. 002_seed_data.sql
3. 003_trigger_provision.sql
4. 004_rls_product.sql
5. 005_rls_user_admin.sql
6. 006_views.sql

## Soft-Delete Rule

NO hard deletes. All removals use `UPDATE ... SET record_status = 'INACTIVE'`.

## RLS Override

All RLS policies use `SECURITY DEFINER` to enforce rules even for ADMIN/SUPERADMIN.
