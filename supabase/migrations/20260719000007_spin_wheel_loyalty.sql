-- ============================================================
-- SPIN WHEEL + LOYALTY TIERS
-- Run in Supabase SQL Editor after the main setup migration
-- ============================================================

-- 1. SPIN WHEEL SEGMENTS
CREATE TABLE IF NOT EXISTS public.spin_wheel (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label       text NOT NULL,
  code        text DEFAULT '',
  color       text NOT NULL DEFAULT '#f97316',
  sort_order  int NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.spin_wheel TO anon;
CREATE POLICY "crud_spin_wheel" ON public.spin_wheel FOR ALL USING (true) WITH CHECK (true);

-- Seed (only if empty)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.spin_wheel LIMIT 1) THEN
    INSERT INTO public.spin_wheel (label, code, color, sort_order, active) VALUES
    ('5% OFF',    'Injoy5',  '#f97316', 1, true),
    ('FREE FRIES','FRIES',   '#7c2d12', 2, true),
    ('10% OFF',   'Injoy10', '#ea580c', 3, true),
    ('TRY AGAIN', '',        '#1c1917', 4, true),
    ('15% OFF',   'Injoy15', '#fb923c', 5, true),
    ('FREE COKE', 'COKE',    '#7c2d12', 6, true),
    ('20% OFF',   'FIRE20',  '#dc2626', 7, true),
    ('TRY AGAIN', '',        '#1c1917', 8, true);
  END IF;
END $$;

-- 2. LOYALTY TIERS + REWARDS
CREATE TABLE IF NOT EXISTS public.loyalty_tiers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  min_points  int NOT NULL DEFAULT 0,
  color       text NOT NULL DEFAULT 'from-orange-500 to-red-600',
  sort_order  int NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label       text NOT NULL,
  points      int NOT NULL,
  icon        text NOT NULL DEFAULT '🔥',
  sort_order  int NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_tiers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loyalty_rewards TO anon;
CREATE POLICY "crud_loyalty_tiers" ON public.loyalty_tiers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "crud_loyalty_rewards" ON public.loyalty_rewards FOR ALL USING (true) WITH CHECK (true);

-- Seed tiers (only if empty)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.loyalty_tiers LIMIT 1) THEN
    INSERT INTO public.loyalty_tiers (name, min_points, color, sort_order, active) VALUES
    ('ROOKIE',   0,   'from-orange-500 to-red-600',    1, true),
    ('SILVER',   50,  'from-zinc-200 to-zinc-400',     2, true),
    ('GOLD',     200, 'from-amber-300 to-orange-500',   3, true),
    ('PLATINUM', 500, 'from-zinc-300 to-zinc-500',     4, true);
  END IF;
END $$;

-- Seed rewards (only if empty)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.loyalty_rewards LIMIT 1) THEN
    INSERT INTO public.loyalty_rewards (label, points, icon, sort_order, active) VALUES
    ('Free Fries',  50,  '🔥', 1, true),
    ('Free Burger', 200, '🔥', 2, true),
    ('VIP Table',   500, '🔥', 3, true);
  END IF;
END $$;
