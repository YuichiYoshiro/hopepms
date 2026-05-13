# Sprint 1 - Project Scaffold & Auth

## Completed Tasks

### Week 1: Foundation
- [x] Initialize Vite + React 18 project with Tailwind CSS
- [x] Create `supabaseClient.js` reading from `.env`
- [x] Set up React Router v6 with all routes
- [x] Create `ProtectedRoute` component
- [x] Build `AuthContext.jsx` with sign-in, sign-up, sign-out functionality
- [x] Build Login page (email/password + Google OAuth)
- [x] Build Register page
- [x] Implement `/auth/callback` route for OAuth
- [x] Implement login guard: check `record_status = 'ACTIVE'` on auth state change
- [x] Add soft block for INACTIVE users with logout

## Key Features

### Authentication Flow
1. Email/Password registration → Supabase sends confirmation email
2. Google OAuth sign-in → Auto-redirect to `/auth/callback`
3. Account created as `USER / INACTIVE` by default
4. Admin/SUPERADMIN must activate account
5. INACTIVE users are blocked from accessing app

### Login Guard
- On every `SIGNED_IN` event, check `record_status`
- If `INACTIVE`, auto-signOut and show alert
- User redirected to `/login`

### Routes Configured
- `/login` — public
- `/register` — public
- `/auth/callback` — public
- `/products` — protected
- `/deleted-items` — protected (ADMIN/SUPERADMIN only)
- `/reports/product` — protected (REP_001 right)
- `/reports/top-selling` — protected (REP_002 right)
- `/admin/users` — protected (ADM_USER right)

## Environment Setup

Create `.env` from `.env.example`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment Notes

- Google OAuth redirect URLs must be configured in Supabase Auth settings
- For production: set redirect URL to `https://yourdomain.com/auth/callback`
- For development: use `http://localhost:5173/auth/callback`

## Testing Checklist

- [x] Email registration flow works
- [x] Confirmation email is sent
- [x] Google OAuth redirects correctly
- [x] INACTIVE users are blocked from app
- [x] ACTIVE users can access protected routes
- [ ] Sprint 2: Database + Rights Matrix verification
