-- Add role column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Create a function to handle admin user creation
CREATE OR REPLACE FUNCTION handle_admin_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user metadata contains role = admin, update the profile
  IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    UPDATE profiles
    SET role = 'admin'
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run the function when a user is created or updated
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_admin_user_creation();

DROP TRIGGER IF EXISTS on_auth_user_updated_admin ON auth.users;
CREATE TRIGGER on_auth_user_updated_admin
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_admin_user_creation();
