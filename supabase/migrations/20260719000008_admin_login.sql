-- ============================================================
-- ADMIN LOGIN
-- Creates admin user in Supabase Auth
-- Run in Supabase SQL Editor
-- ============================================================

-- Clean up any partial previous attempts
DELETE FROM auth.identities WHERE identity_data ->> 'email' = 'injoyburger@gmail.com';
DELETE FROM auth.users WHERE email = 'injoyburger@gmail.com';

-- Insert admin user into auth.users (password: 123456)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'injoyburger@gmail.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Insert into identities (required for Supabase Auth)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) SELECT
  gen_random_uuid(),
  id,
  jsonb_build_object('sub', id, 'email', email),
  'email',
  email,
  now(),
  now(),
  now()
FROM auth.users
WHERE email = 'injoyburger@gmail.com';
