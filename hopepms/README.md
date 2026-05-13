# HopePMS — Hope, Inc. Product Management System

A role-aware, rights-enforced product management system built for a 5-member BS Information Technology team.

**Tech Stack**: React 18 + Vite + Tailwind CSS + Supabase (PostgreSQL) + Supabase Auth

---

## Overview

HopePMS is a **secure, scalable web application** with:
- ✅ **Email & Google OAuth authentication**
- ✅ **Role-based access control** (SUPERADMIN, ADMIN, USER)
- ✅ **Rights-enforced product CRUD** with soft-delete
- ✅ **Admin dashboard** for user management
- ✅ **Reporting module** (product listing, top sellers)
- ✅ **Row-Level Security (RLS)** enforced at database layer
- ✅ **SUPERADMIN protection** — immutable seed account
- ✅ **Audit trail** via stamp columns (creation/modification metadata)

---

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Supabase account (free tier works)

### Setup

1. **Clone and install**
   ```bash
   git clone <your-repo-url> hopepms
   cd hopepms
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials:
   # VITE_SUPABASE_URL=https://your-project.supabase.co
   # VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Deploy database migrations to Supabase**
   - Open Supabase SQL editor
   - Run migrations in order: `db/migrations/001_*.sql` through `006_*.sql`
   - Verify tables and RLS policies created

4. **Start development server**
   ```bash
   npm run dev
   # Runs on http://localhost:5173
   ```

5. **Build for production**
   ```bash
   npm run build
   # Output in dist/
   ```

---

## Project Structure

```
hopepms/
├── src/
│   ├── contexts/
│   │   ├── AuthContext.jsx        # Auth state + session mgmt
│   │   └── UserRightsContext.jsx  # Rights map from DB
│   ├── hooks/
│   │   └── useRights.js           # Hook to access rights
│   ├── components/
│   │   ├── ProtectedRoute.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── AddProductModal.jsx
│   │   ├── EditProductModal.jsx
│   │   └── DeleteConfirmDialog.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── AuthCallbackPage.jsx
│   │   ├── ProductListPage.jsx
│   │   ├── DeletedItemsPage.jsx
│   │   ├── ProductReportPage.jsx
│   │   ├── TopSellingPage.jsx
│   │   └── UserManagementPage.jsx
│   ├── services/
│   │   ├── productService.js
│   │   ├── priceHistService.js
│   │   ├── reportService.js
│   │   └── userService.js
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── db/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_seed_data.sql
│       ├── 003_trigger_provision.sql
│       ├── 004_rls_product.sql
│       ├── 005_rls_user_admin.sql
│       ├── 006_views.sql
│       └── ERD.md
├── docs/
│   ├── sprint1-log.md
│   ├── sprint2-log.md
│   ├── sprint3-log.md
│   └── user-manual.md
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── DEPLOYMENT.md
├── TESTING.md
└── README.md
```

---

## Authentication

### Sign-Up (Email/Password)
1. User fills: First Name, Last Name, Username, Email, Password
2. Supabase sends confirmation email
3. User account created as `USER / INACTIVE`
4. ADMIN/SUPERADMIN must activate to grant access

### Sign-In (Google OAuth)
1. User clicks "Sign in with Google"
2. Redirects to `/auth/callback`
3. Auto-provisioned as `USER / INACTIVE`
4. Awaits ADMIN activation

### Account Activation
- Only ADMIN/SUPERADMIN can activate accounts
- User sees: *"Your account is pending activation..."*
- Once activated (`record_status = 'ACTIVE'`), user gains access

---

## Rights Matrix

| Feature | SUPERADMIN | ADMIN | USER |
|---|---|---|---|
| **PRD_ADD** — Add Product | ✓ | ✓ | ✓ |
| **PRD_EDIT** — Edit Product | ✓ | ✓ | ✓ |
| **PRD_DEL** — Delete Product | ✓ | ✗ | ✗ |
| **REP_001** — Product Report | ✓ | ✓ | ✓ |
| **REP_002** — Top Selling | ✓ | ✗ | ✗ |
| **ADM_USER** — Manage Users | ✓ | ✗ | ✗ |

---

## Key Features

### 1. Product Management
- **Add**: Create new products with code, description, unit, price
- **Edit**: Update description and unit
- **Soft-Delete**: Mark as INACTIVE (never permanently removed)
- **Recover**: Reactivate deleted products (ADMIN/SUPERADMIN only)
- **Stamps**: Audit trail with user ID and timestamp

### 2. Product Visibility
- **USER accounts**: See ACTIVE products only (RLS enforced)
- **ADMIN/SUPERADMIN**: See all products (ACTIVE + INACTIVE)
- **Deleted Items page**: ADMIN/SUPERADMIN only recovery interface

### 3. Reports
- **REP_001**: Product listing with current prices
- **REP_002**: Top-selling products by quantity (ADMIN/SUPERADMIN only)

### 4. User Management
- **Activate/Deactivate**: Toggle user access
- **SUPERADMIN Protection**: Cannot be modified by any user
- **RLS Enforcement**: ADMIN cannot bypass database protections

### 5. Security
- ✅ **RLS Policies**: Product, user, rights tables protected
- ✅ **Soft Deletes Only**: No hard DELETE statements in codebase
- ✅ **Audit Trail**: Every action stamped with user ID + timestamp
- ✅ **OAuth**: Google sign-in with automatic provisioning
- ✅ **Session Management**: Auto-logout for INACTIVE users

---

## Database Schema

### Core Tables
- `product` — Product catalog (with record_status, stamp)
- `priceHist` — Price history per product
- `salesDetail` — Sales line items

### User & Rights
- `user` — User accounts (userId, user_type, record_status, stamp)
- `Module` — Feature modules (Prod_Mod, Report_Mod, Adm_Mod)
- `user_module` — Module assignments per user
- `rights` — Individual rights (PRD_ADD, PRD_EDIT, etc.)
- `UserModule_Rights` — User rights assignments

### Views
- `current_product_price` — Latest price per product
- `top_selling_products` — Aggregated sales by product

See `db/migrations/ERD.md` for detailed schema diagram.

---

## Deployment

### Vercel (Recommended)
```bash
# 1. Push to GitHub
git push origin main

# 2. In Vercel dashboard:
#    - Connect GitHub repo
#    - Set env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
#    - Deploy

# 3. Update Supabase Auth redirect URL:
#    https://your-domain.com/auth/callback
```

### Netlify
```bash
# Similar to Vercel — connect GitHub, set env vars, deploy
```

See `DEPLOYMENT.md` for detailed instructions.

---

## Testing

Comprehensive testing checklist in `TESTING.md`:
- Authentication flows
- Product CRUD + soft-delete
- Rights matrix (18 test cases)
- RLS enforcement
- SUPERADMIN protection
- Report access control
- Deployment verification

---

## Branching Strategy

```
main (production)
  ↑
  └─── dev (integration)
        ↑
        ├─── feat/add-module
        ├─── fix/bug-name
        ├─── db/migration-name
        ├─── test/feature-name
        ├─── docs/update-readme
        └─── refactor/component-name
```

- `main`: Only production-ready code (protected, requires PR review)
- `dev`: Integration branch (protected, stable)
- Feature branches: Branch from `dev`, PR back to `dev`
- Release: Create PR from `dev` → `main` for production

---

## Documentation

- **docs/sprint1-log.md** — Auth & scaffold completion
- **docs/sprint2-log.md** — Database & rights deployment
- **docs/sprint3-log.md** — Product CRUD & reporting
- **docs/user-manual.md** — End-user guide
- **DEPLOYMENT.md** — Production deployment instructions
- **TESTING.md** — QA testing checklist

---

## Absolute Rules (Non-Negotiable)

1. ✅ **NO hard deletes** — All removals are soft: `UPDATE ... SET record_status = 'INACTIVE'`
2. ✅ **USER accounts never see INACTIVE records** — RLS enforces at database layer
3. ✅ **ADMIN/SUPERADMIN can see INACTIVE records** — For recovery
4. ✅ **SUPERADMIN protection** — No user can modify SUPERADMIN account (DB + RLS)
5. ✅ **Stamp columns hidden from USER** — Only ADMIN/SUPERADMIN see audit trail
6. ✅ **No `.env` committed to GitHub** — Use `.env.example` with placeholders

---

## Support & Troubleshooting

### Common Issues

**Q: "Your account is pending activation"**  
A: Contact an ADMIN to activate your account.

**Q: Product disappeared after delete**  
A: It's in Deleted Items (soft-deleted). ADMIN can recover it.

**Q: Google sign-in fails**  
A: Configure redirect URL in Supabase Auth settings.

**Q: Can't add products**  
A: Check your rights: `rights.PRD_ADD === 1`?

For more help, see `TESTING.md` or `docs/user-manual.md`.

---

## Contributing

1. Create feature branch from `dev`
2. Make changes and commit with clear messages
3. Create PR with description of changes
4. Team reviews and approves
5. Merge to `dev` when approved

---

## License

For Hope, Inc. — Capstone Project BS Information Technology

---

## Team

- **Product Owner**: [Team Lead Name]
- **Technical Lead**: [Lead Developer Name]
- **Frontend**: [Frontend Dev Names]
- **Backend/Database**: [Backend Dev Names]
- **QA/Testing**: [QA Name]

---

**Last Updated**: May 13, 2026  
**Status**: Ready for Deployment