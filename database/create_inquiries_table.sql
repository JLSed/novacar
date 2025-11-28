-- Create inquiries table for storing car purchase inquiries
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  inquiry TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_inquiries_car_id ON inquiries(car_id);
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX idx_inquiries_email ON inquiries(email);

-- Enable RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own inquiries
CREATE POLICY "Users can view their own inquiries" ON inquiries
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Create policy for authenticated users to insert inquiries
CREATE POLICY "Authenticated users can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy for users to update their own inquiries (before confirmation)
CREATE POLICY "Users can update their own pending inquiries" ON inquiries
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Create policy for admins to update any inquiry
CREATE POLICY "Admins can update any inquiry" ON inquiries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.access_level = 0
    )
  );

-- Create policy for admins to delete inquiries
CREATE POLICY "Admins can delete inquiries" ON inquiries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.access_level = 0
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
