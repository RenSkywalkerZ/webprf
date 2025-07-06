-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  school VARCHAR(255),
  grade VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitions table
CREATE TABLE competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(255),
  base_fee INTEGER NOT NULL,
  max_participants INTEGER,
  participants_count INTEGER DEFAULT 0,
  color VARCHAR(100),
  icon VARCHAR(100),
  form_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batches table
CREATE TABLE batches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_multiplier DECIMAL(3,2) DEFAULT 1.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registrations table
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  batch_number INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_proof VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, competition_id)
);

-- Insert default batches
INSERT INTO batches (name, start_date, end_date, price_multiplier) VALUES
('Batch 1', '2025-07-07', '2025-07-29', 1.00),
('Batch 2', '2025-08-01', '2025-08-15', 1.20),
('Batch 3', '2025-08-18', '2025-08-27', 1.50);

-- Insert competitions
INSERT INTO competitions (title, description, category, base_fee, participants_count, color, icon, form_url) VALUES
('Physics Competition', 'Kompetisi tingkat SMA/MA dan Perguruan Tinggi untuk menguji kemampuan pengetahuan dan keterampilan analitis dalam bidang fisika.', 'SMA/MA dan Perguruan Tinggi', 75000, 2500, 'from-blue-500 to-purple-600', 'Trophy', 'https://forms.google.com/physics-competition'),
('Scientific Writing', 'Kompetisi penulisan karya ilmiah dalam bidang fisika tingkat SMP/MT hingga Perguruan Tinggi.', 'SMP/MT - Perguruan Tinggi', 50000, 1200, 'from-teal-400 to-cyan-600', 'Trophy', 'https://forms.google.com/scientific-writing'),
('Lomba Robotik', 'Kompetisi robotik untuk pelajar TK hingga SMA/MA yang menggabungkan prinsip fisika dan teknologi modern dalam perancangan, perakitan, dan pemrograman robot.', 'TK/sederajat - SMA/MA', 100000, 800, 'from-purple-400 to-pink-600', 'Trophy', 'https://forms.google.com/robotics'),
('Science Project', 'Kompetisi proyek sains tingkat SMP/MT dan SMA/MA yang mengatasi masalah berkelanjutan melalui pendekatan fisika.', 'SMP/MT dan SMA/MA', 60000, 600, 'from-green-400 to-teal-600', 'Trophy', 'https://forms.google.com/science-project'),
('Lomba Praktikum', 'Ajang perlombaan dalam melakukan berbagai eksperimen fisika tingkat SMP/MT dan SMA/MA.', 'SMP/MT dan SMA/MA', 65000, 500, 'from-indigo-400 to-purple-600', 'Trophy', 'https://forms.google.com/praktikum'),
('Lomba Roket Air', 'Kompetisi merancang dan meluncurkan roket air dengan prinsip-prinsip aerodinamika tingkat SMP/MT dan SMA/MA.', 'SMP/MT dan SMA/MA', 70000, 400, 'from-orange-400 to-red-600', 'Trophy', 'https://forms.google.com/roket-air'),
('Depict Physics', 'Ajang perlombaan dalam membuat konten infografis dan video kreatif untuk masyarakat umum', 'Umum (15-25 Tahun)', 45000, 300, 'from-yellow-400 to-orange-600', 'Trophy', 'https://forms.google.com/depict-physics'),
('Cerdas Cermat', 'Kompetisi cerdas cermat fisika yang menguji kecepatan dan ketepatan dalam menjawab soal-soal fisika dan sains untuk tingkat SD/MI dan SMP/MT.', 'SD/MI dan SMP/MT', 40000, 700, 'from-pink-400 to-rose-600', 'Trophy', 'https://forms.google.com/cerdas-cermat');

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view competitions" ON competitions FOR SELECT TO authenticated;
CREATE POLICY "Users can view own registrations" ON registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own registrations" ON registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view batches" ON batches FOR SELECT TO authenticated;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON competitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
