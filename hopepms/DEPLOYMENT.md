# Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] No hard `DELETE` statements exist
  ```bash
  grep -r "DELETE" src/
  grep -r "\.delete(" src/
  ```
  Should return zero results.

- [ ] All `.env` secrets in `.gitignore`
  ```bash
  git check-ignore .env
  ```

- [ ] No console.error or unhandled errors in production paths
  ```bash
  grep -r "console.log" src/ | grep -v "console.error"
  ```

- [ ] All RLS policies are SECURITY DEFINER
  ```bash
  grep -c "SECURITY DEFINER" db/migrations/0*.sql
  ```
  Should be >= 5

### Database
- [ ] All migrations applied in order (001-006) to Supabase
- [ ] SUPERADMIN seed (user1) exists with full rights
- [ ] RLS enabled on all tables: product, user, UserModule_Rights
- [ ] Trigger `on_auth_user_created` is active
- [ ] Views created: current_product_price, top_selling_products

### Environment
- [ ] `.env` populated with real Supabase credentials
- [ ] `.env.example` has placeholders, not real values
- [ ] Supabase Auth redirect URL configured for production domain

### Testing
- [ ] Email registration flow tested
- [ ] Google OAuth tested (redirects to /auth/callback)
- [ ] Login guard blocks INACTIVE users
- [ ] ACTIVE user can access /products
- [ ] Product CRUD works (add/edit/delete/recover)
- [ ] Stamps visible to ADMIN, hidden to USER
- [ ] Deleted items only visible to ADMIN
- [ ] Reports gated by rights (REP_001, REP_002)
- [ ] User management: SUPERADMIN rows non-editable
- [ ] RLS tested: USER calling API still filtered to ACTIVE

---

## Deployment Steps

### 1. Vercel Deployment

#### Connect GitHub Repository
```bash
# In Vercel dashboard:
1. Click "New Project"
2. Import your GitHub repo (hopepms)
3. Select "React" as framework
4. Vercel auto-detects Vite
```

#### Set Environment Variables in Vercel
In Vercel Project Settings > Environment Variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Configure Build & Output
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm ci`

#### Deploy
```bash
git push to main
# Vercel automatically builds and deploys
```

### 2. Netlify Deployment (Alternative)

#### Connect GitHub
```bash
1. Go to netlify.com
2. Click "New site from Git"
3. Authorize GitHub and select repo
4. Select "Deploy site"
```

#### Build Settings
- Build command: `npm run build`
- Publish directory: `dist`

#### Environment Variables
In Netlify Site Settings > Build & Deploy > Environment:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Deploy
```bash
git push origin main
# Netlify automatically builds and deploys
```

### 3. Post-Deployment

#### Update Supabase Auth Redirect URLs
In Supabase Dashboard > Authentication > URL Configuration:
```
Redirect URLs:
- https://your-domain.com/auth/callback
- https://your-domain.com/
```

#### Verify Production
1. Go to https://your-domain.com
2. Redirect to login page
3. Test registration (should send email)
4. Test Google sign-in
5. Test product CRUD (if account activated)
6. Check browser console for errors

#### Monitor
- Vercel/Netlify: View function logs
- Supabase: Check auth logs and database queries
- Enable error tracking (Sentry optional)

---

## Rollback Plan

### If Deployment Fails
1. Go to Vercel/Netlify dashboard
2. Under "Deployments", select previous successful build
3. Click "Redeploy" or "Promote to Production"
4. Previous version is live within 2 minutes

### Database Rollback (if migrations fail)
1. Connect to Supabase SQL editor
2. Manually run TRUNCATE on affected tables (if needed)
3. Re-apply migrations in order (001-006)

---

## Production Best Practices

### Security
- [ ] Supabase JWT verified on every request (done by RLS)
- [ ] HTTPS enforced (Vercel/Netlify automatic)
- [ ] CORS configured correctly in Supabase
- [ ] No API keys hardcoded in frontend
- [ ] All secrets in environment variables

### Performance
- [ ] Lazy-load pages with React.lazy()
- [ ] Implement product list pagination (optional)
- [ ] Cache reports in localStorage (optional)
- [ ] Enable Vercel/Netlify edge caching

### Monitoring
- [ ] Set up error alerts (Sentry or Vercel)
- [ ] Monitor database query performance
- [ ] Check Supabase bandwidth usage
- [ ] Review auth logs weekly

---

## Version Control

### Main Branch Protection
1. Require pull request reviews before merging
2. Require status checks to pass (if CI configured)
3. No force pushes allowed

### Release Process
1. Create feature branch from `dev`
2. Make changes and commit
3. Create PR to `dev`
4. Team reviews and approves
5. Merge to `dev` when approved
6. When ready for release, create PR from `dev` to `main`
7. Deploy from `main` to production

---

## Scaling Considerations

### Current Limits
- Supabase free tier: 500 MB database, 2 GB bandwidth/month
- Vercel/Netlify free tier: unlimited deployments, 100 GB bandwidth/month

### When to Upgrade
- Database >300 MB: upgrade Supabase
- Active users >100 concurrent: consider Supabase Pro
- Team collaboration needed: upgrade GitHub team plan

### Database Optimization
- Add indexes on frequently queried columns (userId, prodCode, record_status)
- Archive old salesDetail records annually (soft-delete approach)
- Monitor query performance in Supabase dashboard
