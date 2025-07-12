-- Create the new users table with a standard UUID primary key
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL, -- To link with Firebase Auth
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email TEXT,
  name TEXT,
  bio TEXT,
  mfa_enabled BOOLEAN NOT NULL DEFAULT false
);