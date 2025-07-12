# Example LTD

This is a Next.js, Firebase, Supabase, Shadcn and Vercel starter kit.  
> Now using the Next.js app router!

## Stack
- **Next.js** for modern React applications
- **Firebase** for authentication (including multi-factor support)
- **Supabase** for database
- **Shadcn** and Tailwind for UI/styling
- **Vercel** for cloud and automated deployments

## Setup

1. Ensure your Firebase project has authentication enabled.
2. Obtain your public Firebase config and paste it into `components/firebase-providers.tsx`.
3. Create a new file at the root level called `.env.local`.
4. Define the following variables in `.env.local` (see `.env.example` for reference):
    - `FIREBASE_ADMIN_SDK`
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`
5. Get your Firebase service account private key, stringify it, and set the `FIREBASE_ADMIN_SDK` variable to that string.
   > e.g.: `FIREBASE_ADMIN_SDK={"type":"service_account","project_id":"yourproject",...}`
6. Run `npm install` and then `npm run dev` to start the development server.
7. Upgrade Firebase to the Blaze plan and configure your platform to allow multi-factor authentication (MFA). Add test phone numbers for development as needed.
8. Set up your Supabase project and update the environment variables accordingly.

### Database

A sample users table is provided in `sql/users.sql`:

```sql
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL, -- To link with Firebase Auth
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email TEXT,
  name TEXT,
  bio TEXT,
  mfa_enabled BOOLEAN NOT NULL DEFAULT false
);
```

### Features

- **Authentication**: Firebase Auth with email verification and multi-factor authentication (MFA) via phone number and reCAPTCHA.
- **User Management**: Supabase-backed user profiles, including MFA status.
- **Dashboard**: Clean, professional placeholder dashboard with four stat cards, ready for custom metrics.
- **UI/UX**: Modern, accessible design using Tailwind CSS and Shadcn components.
- **Environment Variables**: All sensitive keys and endpoints are managed via `.env.local` (see `.env.example`).

### Notes

- You must define the same environment variables in Vercel for production deployments.
- Follow the structure in `.env.example` for all required keys.
- The dashboard is intentionally minimal, providing a clean starting point for your own metrics and business logic.

**Created by Example LTD**
