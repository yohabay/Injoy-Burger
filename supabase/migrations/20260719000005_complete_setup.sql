-- ============================================================
-- INJOY BURGERS: COMPLETE SETUP
-- Tables + Policies + Seed Data + Storage
-- Run this ONCE in Supabase SQL Editor
-- ============================================================

-- 1. DROP ALL EXISTING POLICIES (every possible name)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
  DROP POLICY IF EXISTS "Anyone can manage menu items" ON public.menu_items;
  DROP POLICY IF EXISTS "Authenticated can manage menu items" ON public.menu_items;
  DROP POLICY IF EXISTS "Anyone can insert menu items" ON public.menu_items;
  DROP POLICY IF EXISTS "Anyone can update menu items" ON public.menu_items;
  DROP POLICY IF EXISTS "Anyone can delete menu items" ON public.menu_items;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view videos" ON public.site_videos;
  DROP POLICY IF EXISTS "Anyone can manage videos" ON public.site_videos;
  DROP POLICY IF EXISTS "Authenticated can manage videos" ON public.site_videos;
  DROP POLICY IF EXISTS "Anyone can view site videos" ON public.site_videos;
  DROP POLICY IF EXISTS "Anyone can insert site videos" ON public.site_videos;
  DROP POLICY IF EXISTS "Anyone can update site videos" ON public.site_videos;
  DROP POLICY IF EXISTS "Anyone can delete site videos" ON public.site_videos;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view images" ON public.site_images;
  DROP POLICY IF EXISTS "Anyone can manage images" ON public.site_images;
  DROP POLICY IF EXISTS "Authenticated can manage images" ON public.site_images;
  DROP POLICY IF EXISTS "Anyone can view site images" ON public.site_images;
  DROP POLICY IF EXISTS "Anyone can insert site images" ON public.site_images;
  DROP POLICY IF EXISTS "Anyone can update site images" ON public.site_images;
  DROP POLICY IF EXISTS "Anyone can delete site images" ON public.site_images;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read access" ON storage.objects;
  DROP POLICY IF EXISTS "Public read content" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
  DROP POLICY IF EXISTS "Anon upload content" ON storage.objects;
  DROP POLICY IF EXISTS "Anon can upload" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can delete" ON storage.objects;
  DROP POLICY IF EXISTS "Anon can delete" ON storage.objects;
  DROP POLICY IF EXISTS "Anon delete content" ON storage.objects;
EXCEPTION WHEN others THEN NULL;
END $$;

-- 2. ENSURE GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_images TO anon;

-- 3. CREATE NEW POLICIES (unique names)
CREATE POLICY "crud_menu_items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "crud_site_videos" ON public.site_videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "crud_site_images" ON public.site_images FOR ALL USING (true) WITH CHECK (true);

-- 4. STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('content', 'content', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_read" ON storage.objects FOR SELECT USING (bucket_id = 'content');
CREATE POLICY "storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'content');
CREATE POLICY "storage_delete" ON storage.objects FOR DELETE USING (bucket_id = 'content');

-- 5. SEED DATA (only inserts if table is empty)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.menu_items LIMIT 1) THEN
    INSERT INTO public.menu_items (number, name, tag, description, price, img, video, category, sort_order) VALUES
    ('01', 'BBQ Cheese Burger', 'Signature · Smoky', 'House BBQ glaze, smoked cheddar, crispy onions, brioche.', 770.50, '/media/google/Injoy-g0.jpg', '/media/hero-cinematic.mp4', 'Most Ordered', 1),
    ('02', 'Triple Burger', 'Triple Stack', 'Three Injoy patties, American cheese, secret sauce.', 943, '/media/google/Injoy-g1.jpg', '/media/eating-burger.mp4', 'Most Ordered', 2),
    ('03', 'Malmo Injoy', 'House Favourite', 'Double Injoy, caramelised onion jam, mustard mayo.', 874, '/media/google/Injoy-g2.jpg', '/media/hero-cinematic.mp4', 'Most Ordered', 3),
    ('04', 'Chili Burger', 'Spicy · Awaze heat', 'Berbere chili glaze, jalapeños, pepper jack, lime crema.', 759, '/media/google/Injoy-g3.jpg', '/media/pizza-making.mp4', 'Most Ordered', 4),
    ('05', 'Hillbilly BBQ Burger', 'Smokehouse', 'Bacon, onion rings, BBQ, smoked cheddar, toasted bun.', 897, '/media/google/Injoy-g4.jpg', '/media/eating-burger.mp4', 'Main Dish', 5),
    ('06', 'Beef Burger', 'Classic', 'Single Injoy patty, cheese, pickles, house sauce.', 724.50, '/media/google/Injoy-g5.jpg', '/media/hero-cinematic.mp4', 'Main Dish', 6),
    ('07', 'Loqito Bandito', 'Tex-Mex', 'Injoy patty, guacamole, salsa roja, crispy tortilla, jack.', 874, '/media/google/Injoy-g6.jpg', '/media/pizza-making.mp4', 'Main Dish', 7),
    ('08', 'Sausage Burger', 'Hearty', 'Bratwurst, melted Swiss, mustard, sauerkraut, pretzel bun.', 782, '/media/google/Injoy-g7.jpg', '/media/eating-burger.mp4', 'Main Dish', 8);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.site_videos LIMIT 1) THEN
    INSERT INTO public.site_videos (label, section, src, poster, sort_order) VALUES
    ('hero-cinematic', 'hero', '/media/hero-cinematic.mp4', '/media/hero-cinematic.jpg', 1),
    ('eating-burger', 'hero', '/media/eating-burger.mp4', '/media/eating-burger.jpg', 2),
    ('rider-ride', 'rider', '/media/rider-ride.mp4', '/media/rider-ride.jpg', 3),
    ('pizza-making', 'menu', '/media/pizza-making.mp4', '/media/pizza-making.jpg', 4),
    ('scene-01-opening', 'movie-story', '/media/hero-cinematic.mp4', '/media/hero-cinematic.jpg', 5),
    ('scene-02-story', 'movie-story', '/media/pizza-making.mp4', '/media/pizza-making.jpg', 6),
    ('scene-03-chef', 'movie-story', '/media/eating-burger.mp4', '/media/eating-burger.jpg', 7),
    ('scene-04-signature', 'movie-story', '/media/rider-ride.mp4', '/media/rider-ride.jpg', 8),
    ('scene-05-reviews', 'movie-story', '/media/hero-cinematic.mp4', '/media/hero-cinematic.jpg', 9),
    ('scene-06-final', 'movie-story', '/media/rider-ride.mp4', '/media/rider-ride.jpg', 10);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.site_images LIMIT 1) THEN
    INSERT INTO public.site_images (label, section, src, alt, sort_order) VALUES
    ('google-review-0', 'lens', '/media/google/Injoy-g0.jpg', 'BBQ Cheese Burger - Hannah Berr', 1),
    ('google-review-1', 'lens', '/media/google/Injoy-g1.jpg', 'Triple Burger - Ahmed Albalawi', 2),
    ('google-review-2', 'lens', '/media/google/Injoy-g2.jpg', 'Malmo Injoy - Ethiopiatravelers', 3),
    ('google-review-3', 'lens', '/media/google/Injoy-g3.jpg', 'Chili Burger - Ethiopiatravelers', 4),
    ('google-review-4', 'lens', '/media/google/Injoy-g4.jpg', 'Hillbilly BBQ - Yonas Desalegn', 5),
    ('google-review-5', 'lens', '/media/google/Injoy-g5.jpg', 'Beef Burger - Nathnael Tekabe', 6),
    ('google-review-6', 'lens', '/media/google/Injoy-g6.jpg', 'Loqito Bandito - Yonas Desalegn', 7),
    ('google-review-7', 'lens', '/media/google/Injoy-g7.jpg', 'Sausage Burger - coach mousa', 8),
    ('google-review-8', 'lens', '/media/google/Injoy-g8.jpg', 'Google Review - Muaz', 9),
    ('google-review-9', 'lens', '/media/google/Injoy-g9.jpg', 'Google Review - ayman aljudaya', 10),
    ('google-logo', 'lens', '/media/google/logoimage.png', 'Google Reviews Logo', 11),
    ('hero-burger', 'hero', '/media/hero-cinematic.jpg', 'Hero Burger', 12),
    ('rider', 'rider', '/media/rider-ride.jpg', 'Delivery Rider', 13),
    ('triple-burger', 'meta', '/media/triple-burger.jpg', 'Triple Burger OG Image', 14);
  END IF;
END $$;
