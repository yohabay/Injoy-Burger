-- Fix: rename 'google-review' section to 'lens' in site_images
UPDATE public.site_images SET section = 'lens' WHERE section = 'google-review';
