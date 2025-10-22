/*
  # Create users table for QSR POS application

  1. New Tables
    - `users`
      - `id` (varchar, primary key) - UUID generated automatically
      - `username` (text, unique, not null) - User's login username
      - `password` (text, not null) - Hashed password for authentication
      - `created_at` (timestamptz) - Timestamp of user creation
  
  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own user data
    
  3. Notes
    - This table is used for POS system authentication
    - Passwords should be hashed before storage using bcrypt or similar
*/

CREATE TABLE IF NOT EXISTS users (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::varchar = id);

CREATE POLICY "Service role can manage users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);