-- Create cars table
CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_number TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  engine_size TEXT,
  horsepower INTEGER,
  drive_type TEXT,
  exterior_color TEXT,
  interior_color TEXT,
  number_of_doors INTEGER,
  seating_capacity INTEGER,
  vin TEXT,
  condition TEXT NOT NULL,
  description TEXT,
  features TEXT[],
  image_urls TEXT[],
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending', 'reserved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_year CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  CONSTRAINT valid_month CHECK (month >= 1 AND month <= 12),
  CONSTRAINT valid_price CHECK (price >= 0)
);

-- Create index for faster queries
CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_price ON cars(price);
CREATE INDEX idx_cars_created_at ON cars(created_at);

-- Enable RLS
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view available cars" ON cars
  FOR SELECT USING (status = 'available' OR auth.uid() IS NOT NULL);

-- Create policy for authenticated users to insert
CREATE POLICY "Authenticated users can insert cars" ON cars
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy for authenticated users to update
CREATE POLICY "Authenticated users can update cars" ON cars
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create policy for authenticated users to delete
CREATE POLICY "Authenticated users can delete cars" ON cars
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
