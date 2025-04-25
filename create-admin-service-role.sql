-- Create a function that can be used to set a user as admin
-- This function will be executed by the service role, which bypasses RLS
CREATE OR REPLACE FUNCTION set_user_as_admin(user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO profiles (id, role)
  VALUES (user_id, 'admin')
  ON CONFLICT (id) 
  DO UPDATE SET role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
