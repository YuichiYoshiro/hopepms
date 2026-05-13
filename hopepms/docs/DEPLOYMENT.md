# HopePMS — Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Supabase account (free tier eligible)
- Vercel or Netlify account

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/[team]/hopepms.git
cd hopepms
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project name (e.g., "hopepms")
4. Create strong password
5. Copy Project URL and Anon Key to `.env`

### 5. Deploy Database Migrations

In Supabase SQL Editor, run each migration in order:

**001_initial_schema.sql**
- Creates product, priceHist, salesDetail, user, Module, rights tables

**002_seed_data.sql**
- Seeds Modules (Prod_Mod, Report_Mod, Adm_Mod)
- Seeds Rights (PRD_ADD, PRD_EDIT, etc.)
- Seeds SUPERADMIN user (user1)

**003_trigger_provision.sql**
- Creates provision_new_user() trigger
- Auto-provisions new users as USER/INACTIVE

**004_rls_product.sql**
- Enables RLS on product table
- Sets policies for SELECT, INSERT, UPDATE

**005_rls_user_admin.sql**
- Enables RLS on user and UserModule_Rights tables
- Protects SUPERADMIN modifications

**006_views.sql**
- Creates current_product_price view
- Creates top_selling_products view

### 6. Configure Supabase Auth

**Email/Password**:
1. Go to Authentication > Providers
2. Enable Email
3. Set confirmation required

**Google OAuth**:
1. Go to Authentication > Providers > Google
2. Enable Google
3. Add your OAuth credentials:
   - Client ID and Secret from Google Cloud Console
   - Or use Supabase-managed OAuth

**Redirect URLs**:
Add to Authentication > URL Configuration:
```
http://localhost:5173/auth/callback
https://hopepms.vercel.app/auth/callback
https://hopepms.netlify.app/auth/callback
```

### 7. Start Development Server
```bash
npm run dev
```

Open http://localhost:5173

---

## GitHub Setup

### 1. Create Repository
```bash
git init
git add .
git commit -m "Initial commit: HopePMS scaffold"
git branch -M main
git remote add origin https://github.com/[team]/hopepms.git
git push -u origin main
```

### 2. Create dev Branch
```bash
git checkout -b dev
git push -u origin dev
```

### 3. Protect Branches

In GitHub Settings > Branches:

**main**:
- ✓ Require pull request reviews (1+ approvals)
- ✓ Require status checks to pass
- ✓ Require branches to be up to date
- ✓ Dismiss stale PR approvals
- ✓ Require code owner reviews

**dev**:
- ✓ Require pull request reviews (1 approval)
- ✓ Require status checks to pass

---

## Production Deployment (Vercel)

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Paste GitHub repo URL
4. Select framework: Vite
5. Click Import

### 2. Set Environment Variables
In Vercel Project Settings > Environment Variables:

**Production**:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Preview & Development**:
(Same as production for now, or use separate Supabase project)

### 3. Configure Deploy Triggers
**Production Deployments**:
- Branch: main
- Trigger: On merge to main

**Preview Deployments**:
- Branch: dev
- Trigger: On push to dev

### 4. Deploy
Push to main branch:
```bash
git checkout main
git merge dev
git push origin main
```

Vercel auto-deploys. Check https://vercel.com/deployments

### 5. Update Auth Redirect URLs
In Supabase Authentication > URL Configuration, add:
```
https://hopepms.vercel.app/auth/callback
```

---

## Production Deployment (Netlify)

### 1. Connect Repository
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Select GitHub
4. Authorize and select hopepms repo

### 2. Build Settings
- Base directory: (leave blank)
- Build command: `npm run build`
- Publish directory: `dist`

### 3. Set Environment Variables
In Site Settings > Build & Deploy > Environment:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Configure Deploy Settings
**Production**:
- Branch: main
- Auto publish: On

**Preview**:
- Branch: dev
- Deploy previews: On

### 5. Deploy
Push to main:
```bash
git push origin main
```

Netlify auto-builds and deploys to production domain.

### 6. Update Auth Redirect URLs
In Supabase, add:
```
https://hopepms.netlify.app/auth/callback
```

---

## CI/CD Pipeline (Optional)

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main, dev]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npm run lint
      - name: Check for hard deletes
        run: |
          ! grep -r "DELETE FROM" src/ db/
          ! grep -r "\.delete(" src/
```

---

## Post-Deployment Verification

### 1. Test All Routes
- [ ] GET http://yourapp/login → LoginPage loads
- [ ] GET http://yourapp/register → RegisterPage loads
- [ ] GET http://yourapp/products → ProtectedRoute redirects to /login
- [ ] POST auth (email) → Confirmation email received
- [ ] POST auth (Google) → OAuth redirect works
- [ ] GET http://yourapp/auth/callback → Redirects to /products if ACTIVE

### 2. Test User Rights (3 types × 6 rights = 18 tests)
See [SECURITY.md](./SECURITY.md#testing--verification)

### 3. Test Soft Delete
1. Add product as USER
2. Delete product
3. Verify product disappears from USER's list
4. Login as ADMIN
5. Go to /deleted-items
6. Verify product visible
7. Click Recover
8. Re-login as USER
9. Verify product reappears

### 4. Test SUPERADMIN Protection
1. Login as ADMIN
2. Go to /admin/users
3. Find SUPERADMIN row
4. Verify all buttons disabled
5. Try to modify via API → RLS blocks

### 5. Audit for Hard Deletes
```bash
grep -r "DELETE FROM" .
grep -r "\.delete(" src/
# Expected: 0 results (only comments)
```

---

## Monitoring & Logs

### Supabase Logs
- Auth: Authentication > User Signups
- Database: SQL Editor > Logs
- RLS: Authentication > Audit Log

### Vercel/Netlify Logs
- Build logs: Deployments > Build & Deploy
- Runtime logs: Functions
- Browser console: DevTools

### Error Tracking (Optional)
- Sentry: https://sentry.io
- LogRocket: https://logrocket.com

---

## Scaling & Maintenance

### Database Backups
- Supabase: Automatic daily backups (free tier)
- Manual: Export SQL from Supabase dashboard

### Performance Optimization
- Enable CloudFlare (free)
- Cache static assets
- Use Supabase edge functions for complex queries

### Security Updates
- Monitor GitHub Dependabot
- Run `npm audit` monthly
- Update dependencies quarterly

---

## Troubleshooting

### Issue: Infinite Redirect Loop
**Cause**: Auth callback not configured
**Fix**: Add redirect URL in Supabase > Authentication > URL Configuration

### Issue: User Sees INACTIVE Products
**Cause**: RLS policy not applied
**Fix**: Re-run 004_rls_product.sql in Supabase SQL Editor

### Issue: Google OAuth Not Working
**Cause**: OAuth credentials not configured
**Fix**: Add OAuth app credentials to Supabase > Authentication > Providers > Google

### Issue: Build Fails on Deploy
**Cause**: Missing env vars or deps
**Fix**: Run `npm run build` locally to debug

---

## Team Collaboration

### Branching Strategy
1. Feature branches: `feat/feature-name` off dev
2. Bugfix branches: `fix/bug-name` off dev
3. Hotfix branches: `hotfix/issue-name` off main
4. PR → dev (after review)
5. Release → main (via GitHub release)

### PR Process
1. Push to feature branch
2. Open PR against dev
3. Add description: What, Why, How
4. Assign reviewers
5. Address feedback
6. Merge when approved
7. Delete branch

### Release Process
1. Ensure dev is stable
2. Create PR: dev → main
3. Title: "Release v1.0.0"
4. Wait for approvals
5. Merge to main
6. Vercel/Netlify auto-deploys
7. Test production

---

**Last Updated**: May 13, 2026
**Version**: 1.0.0
