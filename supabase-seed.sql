-- ArubaSave Seed Data
-- Run this in Supabase SQL Editor AFTER:
--   1. Running supabase-schema.sql
--   2. Signing up at least one user via /auth/signup
--
-- This script uses the first user found in profiles as the business owner.

DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM public.profiles LIMIT 1;

  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'No user found in profiles. Sign up first at /auth/signup, then run this seed.';
  END IF;

  -- Insert businesses
  INSERT INTO public.businesses (id, name, category, location, description, image_url, owner_id) VALUES
    ('b1000000-0000-0000-0000-000000000001'::uuid, 'Zeerovers Restaurant', 'Restaurants', 'Savaneta, Aruba', 'Authentic local seafood experience right on the water. A beloved Aruba institution serving the freshest catch of the day.', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', admin_id),
    ('b1000000-0000-0000-0000-000000000002'::uuid, 'Aruba Watersports', 'Activities', 'Palm Beach, Aruba', 'Premier watersports center offering snorkeling, diving, jet ski rentals, and more.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', admin_id),
    ('b1000000-0000-0000-0000-000000000003'::uuid, 'Manchebo Beach Spa', 'Spa & Wellness', 'Manchebo Beach, Aruba', 'Luxury beachside spa treatments with stunning ocean views.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', admin_id),
    ('b1000000-0000-0000-0000-000000000004'::uuid, 'Sunset Sailing Aruba', 'Activities', 'Oranjestad Harbor, Aruba', 'Unforgettable sunset sailing tours along Aruba''s stunning coastline.', 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800', admin_id),
    ('b1000000-0000-0000-0000-000000000005'::uuid, 'Wilhelmina Restaurant', 'Restaurants', 'Oranjestad, Aruba', 'Classic Aruban cuisine in the heart of Oranjestad with a rich history.', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', admin_id),
    ('b1000000-0000-0000-0000-000000000006'::uuid, 'Aruba Yoga & Wellness', 'Fitness', 'Eagle Beach, Aruba', 'Beach yoga and wellness retreats for all levels.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', admin_id),
    ('b1000000-0000-0000-0000-000000000007'::uuid, 'Gasparito Restaurant', 'Restaurants', 'Oranjestad, Aruba', 'Traditional cunucu house serving authentic Aruban food in a historic setting.', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', admin_id),
    ('b1000000-0000-0000-0000-000000000008'::uuid, 'Screaming Eagle', 'Restaurants', 'Palm Beach, Aruba', 'Sensational beach club restaurant with live entertainment and creative cuisine.', 'https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=800', admin_id)
  ON CONFLICT (id) DO NOTHING;

  -- Insert deals
  INSERT INTO public.deals (business_id, title, description, original_price, deal_price, expiration_date, images, included, location, rating, total_available, vouchers_sold, is_active) VALUES
    (
      'b1000000-0000-0000-0000-000000000001'::uuid,
      'Fresh Fish Platter for 2',
      'Experience the freshest local catch at Zeerovers, a beloved institution in Aruba. Enjoy a generous platter of freshly fried fish, shrimp, and conch with local sides.',
      65.00, 39.00, NOW() + INTERVAL '30 days',
      ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800','https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'],
      ARRAY['Fish platter for 2','Local side dishes','2 soft drinks','Dessert'],
      'Savaneta 239Z, Aruba', 4.8, 50, 23, true
    ),
    (
      'b1000000-0000-0000-0000-000000000002'::uuid,
      'Snorkeling Adventure Tour',
      'Explore Aruba''s stunning underwater world with a 2-hour guided snorkeling tour. Visit the famous Antilla shipwreck and colorful coral reefs.',
      85.00, 55.00, NOW() + INTERVAL '45 days',
      ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800','https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800'],
      ARRAY['2-hour guided tour','Snorkeling equipment','Underwater guide','Refreshments'],
      'Palm Beach, Aruba', 4.9, 20, 18, true
    ),
    (
      'b1000000-0000-0000-0000-000000000003'::uuid,
      'Luxury Couples Massage',
      'Indulge in a 90-minute couples massage with ocean views at the prestigious Manchebo Beach Spa. Includes aromatherapy and complimentary champagne.',
      180.00, 110.00, NOW() + INTERVAL '60 days',
      ARRAY['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'],
      ARRAY['90-min couples massage','Aromatherapy oils','Champagne for 2','Access to spa facilities'],
      'Manchebo Beach Road 55, Aruba', 4.7, 10, 6, true
    ),
    (
      'b1000000-0000-0000-0000-000000000004'::uuid,
      'Romantic Sunset Sailing',
      'Set sail on a breathtaking 3-hour sunset cruise along Aruba''s stunning coastline. Includes unlimited drinks and fresh snacks.',
      120.00, 75.00, NOW() + INTERVAL '30 days',
      ARRAY['https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800','https://images.unsplash.com/photo-1504076252791-c1de8bb7de31?w=800'],
      ARRAY['3-hour sailing tour','Unlimited drinks','Snacks & snorkeling stop','Professional photos'],
      'Oranjestad Harbor, Aruba', 5.0, 30, 28, true
    ),
    (
      'b1000000-0000-0000-0000-000000000005'::uuid,
      '3-Course Aruban Dinner',
      'Savor authentic Aruban cuisine with a traditional 3-course dinner at the historic Wilhelmina Restaurant in the heart of Oranjestad.',
      90.00, 59.00, NOW() + INTERVAL '40 days',
      ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800','https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'],
      ARRAY['Starter','Main course','Dessert','Glass of wine or local beer'],
      'Wilhelminastraat 2, Oranjestad', 4.6, 40, 15, true
    ),
    (
      'b1000000-0000-0000-0000-000000000006'::uuid,
      'Sunrise Beach Yoga Class',
      'Start your day with an energizing sunrise yoga session on the pristine Eagle Beach. Suitable for all levels.',
      45.00, 25.00, NOW() + INTERVAL '90 days',
      ARRAY['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800','https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'],
      ARRAY['60-min yoga class','Yoga mat rental','Refreshing smoothie','Meditation session'],
      'Eagle Beach, Aruba', 4.8, 15, 8, true
    ),
    (
      'b1000000-0000-0000-0000-000000000007'::uuid,
      'Traditional Aruban Lunch',
      'Enjoy a hearty traditional Aruban lunch at Gasparito, set in a beautiful 17th-century cunucu house.',
      55.00, 35.00, NOW() + INTERVAL '35 days',
      ARRAY['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'],
      ARRAY['Soup of the day','Traditional main dish','Local dessert','Drink included'],
      'Cunucu Abao 0, Oranjestad', 4.7, 30, 12, true
    ),
    (
      'b1000000-0000-0000-0000-000000000008'::uuid,
      'Screaming Eagle Dinner Experience',
      'Experience the legendary Screaming Eagle with a dinner for 2 featuring creative cuisine, cocktails, and live entertainment.',
      150.00, 95.00, NOW() + INTERVAL '50 days',
      ARRAY['https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=800'],
      ARRAY['3-course dinner for 2','Welcome cocktails','Priority seating','Live entertainment'],
      'J.E. Irausquin Blvd 382, Palm Beach', 4.9, 25, 10, true
    );

  RAISE NOTICE 'Seed data inserted successfully! Used owner_id: %', admin_id;
END $$;
