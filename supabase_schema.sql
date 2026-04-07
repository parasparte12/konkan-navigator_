-- ============================================================
-- KONKAN NAVIGATOR — COMPLETE SUPABASE SCHEMA
-- Execute this entire file in the Supabase SQL Editor
-- ============================================================

-- ─── 1. TABLES ──────────────────────────────────────────────

-- 1.1 Profiles (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'traveler' CHECK (role IN ('traveler', 'guide', 'admin')),
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Destinations
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('beach', 'fort', 'temple', 'mountain', 'food', 'waterfall', 'hidden-gem')),
  district TEXT NOT NULL CHECK (district IN ('Ratnagiri', 'Sindhudurg', 'Raigad', 'Thane', 'Palghar')),
  description TEXT NOT NULL,
  short_description TEXT,
  image_url TEXT,
  gallery_urls TEXT[],
  latitude FLOAT,
  longitude FLOAT,
  entry_fee INTEGER DEFAULT 0,
  best_time_to_visit TEXT,
  how_to_reach TEXT,
  nearby_places TEXT[],
  tags TEXT[],
  avg_rating FLOAT DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_hidden_gem BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_district ON destinations(district);
CREATE INDEX IF NOT EXISTS idx_destinations_slug ON destinations(slug);
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(is_featured);

-- 1.3 Guides
CREATE TABLE IF NOT EXISTS guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  profile_image_url TEXT,
  bio TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  languages TEXT[] NOT NULL DEFAULT '{"English", "Hindi", "Marathi"}',
  specialties TEXT[] NOT NULL DEFAULT '{}',
  price_per_day INTEGER NOT NULL,
  price_per_half_day INTEGER,
  home_district TEXT NOT NULL,
  areas_covered TEXT[],
  max_group_size INTEGER DEFAULT 10,
  avg_rating FLOAT DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  phone TEXT,
  whatsapp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guides_district ON guides(home_district);
CREATE INDEX IF NOT EXISTS idx_guides_verified ON guides(is_verified);
CREATE INDEX IF NOT EXISTS idx_guides_available ON guides(is_available);

-- 1.4 Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guide_id UUID REFERENCES guides(id) ON DELETE SET NULL,
  destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  group_size INTEGER NOT NULL DEFAULT 1,
  total_price INTEGER NOT NULL,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guide ON bookings(guide_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);

-- 1.5 Trips
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  days INTEGER NOT NULL CHECK (days BETWEEN 1 AND 10),
  budget INTEGER NOT NULL,
  interests TEXT[] NOT NULL DEFAULT '{}',
  travel_style TEXT CHECK (travel_style IN ('relaxed', 'moderate', 'packed')),
  group_type TEXT CHECK (group_type IN ('solo', 'couple', 'family', 'friends')),
  itinerary JSONB NOT NULL DEFAULT '[]',
  destination_ids UUID[],
  estimated_cost INTEGER,
  is_public BOOLEAN DEFAULT FALSE,
  is_saved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_public ON trips(is_public);

-- 1.6 Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT NOT NULL,
  visit_date DATE,
  images TEXT[],
  helpful_votes INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT review_target CHECK (
    (destination_id IS NOT NULL AND guide_id IS NULL) OR
    (guide_id IS NOT NULL AND destination_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_reviews_destination ON reviews(destination_id);
CREATE INDEX IF NOT EXISTS idx_reviews_guide ON reviews(guide_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- 1.7 Feedback
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  would_recommend TEXT CHECK (would_recommend IN ('yes', 'no', 'maybe')),
  liked_features TEXT[],
  enjoyed_most TEXT,
  star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
  suggestions TEXT,
  page_source TEXT DEFAULT 'feedback',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.8 Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  has_consent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.9 Guide Applications
CREATE TABLE IF NOT EXISTS guide_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  district TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  languages TEXT[] NOT NULL,
  bio TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.10 Transport Routes
CREATE TABLE IF NOT EXISTS transport_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  transport_type TEXT NOT NULL CHECK (transport_type IN ('bus', 'train', 'ferry', 'taxi', 'auto')),
  duration_minutes INTEGER,
  price_min INTEGER,
  price_max INTEGER,
  frequency TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ─── 2. TRIGGERS ────────────────────────────────────────────

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update destination avg_rating on review change
CREATE OR REPLACE FUNCTION update_destination_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_id UUID;
BEGIN
  target_id := COALESCE(NEW.destination_id, OLD.destination_id);
  IF target_id IS NOT NULL THEN
    UPDATE destinations SET
      avg_rating = COALESCE((SELECT AVG(rating)::FLOAT FROM reviews WHERE destination_id = target_id), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE destination_id = target_id)
    WHERE id = target_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_destination_rating ON reviews;
CREATE TRIGGER trg_update_destination_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_destination_rating();

-- Update guide avg_rating on review change
CREATE OR REPLACE FUNCTION update_guide_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_id UUID;
BEGIN
  target_id := COALESCE(NEW.guide_id, OLD.guide_id);
  IF target_id IS NOT NULL THEN
    UPDATE guides SET
      avg_rating = COALESCE((SELECT AVG(rating)::FLOAT FROM reviews WHERE guide_id = target_id), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE guide_id = target_id)
    WHERE id = target_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_guide_rating ON reviews;
CREATE TRIGGER trg_update_guide_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_guide_rating();


-- ─── 3. ROW LEVEL SECURITY ─────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Destinations
CREATE POLICY "Destinations are public" ON destinations FOR SELECT USING (true);
CREATE POLICY "Admin can insert destinations" ON destinations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can update destinations" ON destinations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can delete destinations" ON destinations FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Guides
CREATE POLICY "Guides are public" ON guides FOR SELECT USING (true);
CREATE POLICY "Guides can update own record" ON guides FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can insert guides" ON guides FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can delete guides" ON guides FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings
CREATE POLICY "Users see own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Guides see their bookings" ON bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM guides WHERE id = bookings.guide_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Trips
CREATE POLICY "Users see own trips" ON trips FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own trips" ON trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON trips FOR DELETE USING (auth.uid() = user_id);

-- Reviews
CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can write reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Feedback
CREATE POLICY "Anyone can submit feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Users see own feedback" ON feedback FOR SELECT USING (true);

-- Contact Messages
CREATE POLICY "Anyone can send contact message" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read messages" ON contact_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Guide Applications
CREATE POLICY "Anyone can apply as guide" ON guide_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users see own applications" ON guide_applications FOR SELECT USING (auth.uid() = user_id);

-- Transport Routes
CREATE POLICY "Transport routes are public" ON transport_routes FOR SELECT USING (true);


-- ─── 4. STORAGE BUCKETS ────────────────────────────────────

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('destinations', 'destinations', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('guides', 'guides', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('reviews', 'reviews', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Avatars are public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Destination images are public" ON storage.objects FOR SELECT USING (bucket_id = 'destinations');
CREATE POLICY "Guide images are public" ON storage.objects FOR SELECT USING (bucket_id = 'guides');
CREATE POLICY "Guides can upload own image" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'guides' AND auth.uid() IS NOT NULL);
CREATE POLICY "Review images are public" ON storage.objects FOR SELECT USING (bucket_id = 'reviews');
CREATE POLICY "Users can upload review images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reviews' AND auth.uid() IS NOT NULL);


-- ─── 5. SEED DATA ──────────────────────────────────────────

-- 5.1 Destinations (13 records)
INSERT INTO destinations (name, slug, category, district, description, short_description, image_url, avg_rating, review_count, is_featured, is_hidden_gem, best_time_to_visit, entry_fee) VALUES
('Tarkarli Beach', 'tarkarli-beach', 'beach', 'Sindhudurg', 'Crystal clear waters perfect for scuba diving and snorkeling. Famous for its coral reefs and water sports.', 'Crystal clear waters, coral reefs & water sports', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', 4.8, 245, true, false, 'October to May', 0),
('Sindhudurg Fort', 'sindhudurg-fort', 'fort', 'Sindhudurg', 'A sea fort built by Chhatrapati Shivaji Maharaj in 1664. Built entirely on a rocky island, accessible by boat.', 'Sea fort by Shivaji Maharaj, 1664', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800', 4.7, 189, true, false, 'November to February', 25),
('Ganpatipule Temple', 'ganpatipule-temple', 'temple', 'Ratnagiri', 'Swayambhu Ganesh temple on a pristine beach. One of the most sacred temples on the Konkan Coast.', 'Sacred swayambhu Ganesh temple on beach', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800', 4.6, 312, true, false, 'September to March', 0),
('Amboli Waterfalls', 'amboli-waterfalls', 'waterfall', 'Sindhudurg', 'Stunning waterfall in the Western Ghats, best experienced during and just after monsoon season.', 'Stunning Western Ghats waterfall', 'https://images.unsplash.com/photo-1536697246787-1f7ae568d89a?w=800', 4.5, 98, false, false, 'June to September', 10),
('Murud Beach', 'murud-beach', 'beach', 'Ratnagiri', 'A quiet, unspoilt beach with black sand and dramatic rocky outcrops. Perfect for a peaceful escape.', 'Quiet beach with black sand & rocky outcrops', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800', 4.4, 76, false, false, 'October to March', 0),
('Vijaydurg Fort', 'vijaydurg-fort', 'fort', 'Sindhudurg', 'The oldest fort on the Konkan coast, known as the Eastern Gibraltar. Built in the 9th century.', 'Oldest fort on Konkan Coast, 9th century', 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800', 4.3, 67, false, false, 'October to February', 15),
('Dapoli Beach', 'dapoli-beach', 'beach', 'Ratnagiri', 'A serene beach town with multiple beaches nearby. Known for the Keshavraj temple and coconut groves.', 'Serene beach town with coconut groves', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', 4.2, 54, false, false, 'October to May', 0),
('Velneshwar Temple', 'velneshwar-temple', 'temple', 'Ratnagiri', 'Ancient Shiva temple next to a pristine beach. A rare combination of divine and natural beauty.', 'Ancient Shiva temple beside pristine beach', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800', 4.4, 88, false, false, 'All year', 0),
('Amboli Ghats', 'amboli-ghats', 'mountain', 'Sindhudurg', 'A hill station at 690m altitude. Dense forests, multiple waterfalls, and rich biodiversity.', 'Hill station at 690m with rich biodiversity', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', 4.6, 143, true, false, 'June to February', 0),
('Ratnadurg Fort', 'ratnadurg-fort', 'fort', 'Ratnagiri', 'A small fort on the Ratnadurga promontory, offering panoramic views of Ratnagiri Bay.', 'Fort with panoramic views of Ratnagiri Bay', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800', 4.1, 42, false, false, 'November to March', 10),
('Malvan Seafood Market', 'malvan-seafood-market', 'food', 'Sindhudurg', 'The heart of authentic Malvani cuisine. Fresh catch every morning, famous for Malvani fish curry.', 'Authentic Malvani cuisine, fresh daily catch', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', 4.7, 167, false, false, 'All year', 0),
('Harnai Beach', 'harnai-beach', 'beach', 'Ratnagiri', 'A lesser-known fishing village beach with a historic fort and lighthouse. Truly off the beaten path.', 'Fishing village beach with fort & lighthouse', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800', 4.3, 33, false, true, 'October to April', 0),
('Sawantwadi Palace', 'sawantwadi-palace', 'fort', 'Sindhudurg', 'A magnificent 17th century palace known for Ganjifa paintings and lacquerware crafts.', '17th century palace with Ganjifa art', 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800', 4.2, 58, false, false, 'All year', 20);

-- 5.2 Guides (6 records)
INSERT INTO guides (display_name, bio, experience_years, languages, specialties, price_per_day, home_district, avg_rating, review_count, is_verified, is_available, profile_image_url) VALUES
('Rajesh Sawant', 'Born and raised in Malvan, I have been guiding travellers through the Konkan Coast for 8 years. Expert in water sports and marine life.', 8, '{"English", "Hindi", "Marathi", "Konkani"}', '{"Scuba diving", "Snorkeling", "Fort history", "Seafood tours"}', 2500, 'Sindhudurg', 4.9, 89, true, true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'),
('Priya Desai', 'A passionate historian and nature lover. I specialize in fort treks and temple visits across Ratnagiri district.', 5, '{"English", "Hindi", "Marathi"}', '{"Fort treks", "Temple visits", "Cultural tours", "Photography"}', 2000, 'Ratnagiri', 4.7, 62, true, true, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80'),
('Suresh Naik', 'Wildlife and nature guide with deep knowledge of the Western Ghats biodiversity. Certified trekking guide.', 12, '{"Hindi", "Marathi", "Konkani"}', '{"Trekking", "Wildlife", "Waterfalls", "Bird watching"}', 1800, 'Sindhudurg', 4.8, 104, true, true, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80'),
('Anita Patil', 'Culinary guide specializing in authentic Malvani and Konkan cuisine. I take guests to local markets, fishing docks, and family kitchens.', 3, '{"English", "Hindi", "Marathi"}', '{"Food tours", "Cooking classes", "Market visits", "Local culture"}', 1500, 'Ratnagiri', 4.6, 38, true, true, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80'),
('Mahesh Gawde', 'Expert in water activities and coastal heritage. I have guided over 500 tourists on Sindhudurg fort boat tours.', 10, '{"Hindi", "Marathi", "Konkani"}', '{"Boat tours", "Fishing", "Coastal heritage", "Water sports"}', 2200, 'Sindhudurg', 4.5, 73, true, true, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80'),
('Kavita Rane', 'A multilingual guide focused on spiritual and wellness tourism. I specialize in temple circuits and Ayurvedic experiences.', 6, '{"English", "Hindi", "Marathi", "Gujarati"}', '{"Temple tours", "Wellness", "Yoga retreats", "Spiritual journeys"}', 1700, 'Ratnagiri', 4.4, 45, false, true, 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&q=80');

-- 5.3 Transport Routes (6 records)
INSERT INTO transport_routes (from_location, to_location, transport_type, duration_minutes, price_min, price_max, frequency, notes) VALUES
('Mumbai', 'Ratnagiri', 'train', 300, 200, 800, 'Multiple daily trains', 'Konkan Railway — scenic coastal route'),
('Mumbai', 'Sindhudurg', 'bus', 480, 300, 600, 'Daily overnight buses', 'MSRTC and private operators available'),
('Ratnagiri', 'Ganpatipule', 'bus', 60, 50, 100, 'Hourly buses', 'Local ST bus, auto also available'),
('Malvan', 'Sindhudurg Fort', 'ferry', 10, 40, 40, 'Every 30 mins 7am-6pm', 'Return ticket included'),
('Kankavli', 'Amboli Ghats', 'taxi', 60, 500, 800, 'On demand', 'Shared jeeps available on weekends'),
('Ratnagiri', 'Dapoli', 'bus', 90, 80, 150, 'Every 2 hours', 'Via Guhagar road, scenic route');
