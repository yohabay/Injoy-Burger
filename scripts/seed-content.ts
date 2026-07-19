import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ktggweqoaduoexrgmtx.supabase.co";
const SUPABASE_KEY = "sb_publishable_x139iTSiEoF8eVWUAPF8Mg_hxbMZnO7";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Seeding menu_items...");

  const menuItems = [
    { number: "01", name: "BBQ Cheese Burger", tag: "Signature · Smoky", description: "House BBQ glaze, smoked cheddar, crispy onions, brioche.", price: 770.50, img: "/media/google/Injoy-g0.jpg", video: "/media/hero-cinematic.mp4", category: "Most Ordered", sort_order: 1 },
    { number: "02", name: "Triple Burger", tag: "Triple Stack", description: "Three Injoy patties, American cheese, secret sauce.", price: 943, img: "/media/google/Injoy-g1.jpg", video: "/media/eating-burger.mp4", category: "Most Ordered", sort_order: 2 },
    { number: "03", name: "Malmo Injoy", tag: "House Favourite", description: "Double Injoy, caramelised onion jam, mustard mayo.", price: 874, img: "/media/google/Injoy-g2.jpg", video: "/media/hero-cinematic.mp4", category: "Most Ordered", sort_order: 3 },
    { number: "04", name: "Chili Burger", tag: "Spicy · Awaze heat", description: "Berbere chili glaze, jalapeños, pepper jack, lime crema.", price: 759, img: "/media/google/Injoy-g3.jpg", video: "/media/pizza-making.mp4", category: "Most Ordered", sort_order: 4 },
    { number: "05", name: "Hillbilly BBQ Burger", tag: "Smokehouse", description: "Bacon, onion rings, BBQ, smoked cheddar, toasted bun.", price: 897, img: "/media/google/Injoy-g4.jpg", video: "/media/eating-burger.mp4", category: "Main Dish", sort_order: 5 },
    { number: "06", name: "Beef Burger", tag: "Classic", description: "Single Injoy patty, cheese, pickles, house sauce.", price: 724.50, img: "/media/google/Injoy-g5.jpg", video: "/media/hero-cinematic.mp4", category: "Main Dish", sort_order: 6 },
    { number: "07", name: "Loqito Bandito", tag: "Tex-Mex", description: "Injoy patty, guacamole, salsa roja, crispy tortilla, jack.", price: 874, img: "/media/google/Injoy-g6.jpg", video: "/media/pizza-making.mp4", category: "Main Dish", sort_order: 7 },
    { number: "08", name: "Sausage Burger", tag: "Hearty", description: "Bratwurst, melted Swiss, mustard, sauerkraut, pretzel bun.", price: 782, img: "/media/google/Injoy-g7.jpg", video: "/media/eating-burger.mp4", category: "Main Dish", sort_order: 8 },
  ];

  const { error: menuErr } = await supabase.from("menu_items").insert(menuItems);
  if (menuErr) console.error("menu_items insert error:", menuErr.message);
  else console.log(`  Inserted ${menuItems.length} menu items`);

  console.log("Seeding site_videos...");
  const videos = [
    { label: "hero-cinematic", section: "hero", src: "/media/hero-cinematic.mp4", poster: "/media/hero-cinematic.jpg", sort_order: 1 },
    { label: "eating-burger", section: "hero", src: "/media/eating-burger.mp4", poster: "/media/eating-burger.jpg", sort_order: 2 },
    { label: "rider-ride", section: "rider", src: "/media/rider-ride.mp4", poster: "/media/rider-ride.jpg", sort_order: 3 },
    { label: "pizza-making", section: "menu", src: "/media/pizza-making.mp4", poster: "/media/pizza-making.jpg", sort_order: 4 },
    { label: "scene-01-opening", section: "movie-story", src: "/media/hero-cinematic.mp4", poster: "/media/hero-cinematic.jpg", sort_order: 5 },
    { label: "scene-02-story", section: "movie-story", src: "/media/pizza-making.mp4", poster: "/media/pizza-making.jpg", sort_order: 6 },
    { label: "scene-03-chef", section: "movie-story", src: "/media/eating-burger.mp4", poster: "/media/eating-burger.jpg", sort_order: 7 },
    { label: "scene-04-signature", section: "movie-story", src: "/media/rider-ride.mp4", poster: "/media/rider-ride.jpg", sort_order: 8 },
    { label: "scene-05-reviews", section: "movie-story", src: "/media/hero-cinematic.mp4", poster: "/media/hero-cinematic.jpg", sort_order: 9 },
    { label: "scene-06-final", section: "movie-story", src: "/media/rider-ride.mp4", poster: "/media/rider-ride.jpg", sort_order: 10 },
  ];

  const { error: vidErr } = await supabase.from("site_videos").insert(videos);
  if (vidErr) console.error("site_videos insert error:", vidErr.message);
  else console.log(`  Inserted ${videos.length} videos`);

  console.log("Seeding site_images...");
  const images = [
    { label: "google-review-0", section: "google-review", src: "/media/google/Injoy-g0.jpg", alt: "BBQ Cheese Burger - Hannah Berr", sort_order: 1 },
    { label: "google-review-1", section: "google-review", src: "/media/google/Injoy-g1.jpg", alt: "Triple Burger - Ahmed Albalawi", sort_order: 2 },
    { label: "google-review-2", section: "google-review", src: "/media/google/Injoy-g2.jpg", alt: "Malmo Injoy - Ethiopiatravelers", sort_order: 3 },
    { label: "google-review-3", section: "google-review", src: "/media/google/Injoy-g3.jpg", alt: "Chili Burger - Ethiopiatravelers", sort_order: 4 },
    { label: "google-review-4", section: "google-review", src: "/media/google/Injoy-g4.jpg", alt: "Hillbilly BBQ - Yonas Desalegn", sort_order: 5 },
    { label: "google-review-5", section: "google-review", src: "/media/google/Injoy-g5.jpg", alt: "Beef Burger - Nathnael Tekabe", sort_order: 6 },
    { label: "google-review-6", section: "google-review", src: "/media/google/Injoy-g6.jpg", alt: "Loqito Bandito - Yonas Desalegn", sort_order: 7 },
    { label: "google-review-7", section: "google-review", src: "/media/google/Injoy-g7.jpg", alt: "Sausage Burger - coach mousa", sort_order: 8 },
    { label: "google-review-8", section: "google-review", src: "/media/google/Injoy-g8.jpg", alt: "Google Review - Muaz", sort_order: 9 },
    { label: "google-review-9", section: "google-review", src: "/media/google/Injoy-g9.jpg", alt: "Google Review - ayman aljudaya", sort_order: 10 },
    { label: "google-logo", section: "google-review", src: "/media/google/logoimage.png", alt: "Google Reviews Logo", sort_order: 11 },
    { label: "hero-burger", section: "hero", src: "/media/hero-cinematic.jpg", alt: "Hero Burger", sort_order: 12 },
    { label: "rider", section: "rider", src: "/media/rider-ride.jpg", alt: "Delivery Rider", sort_order: 13 },
    { label: "triple-burger", section: "meta", src: "/media/triple-burger.jpg", alt: "Triple Burger OG Image", sort_order: 14 },
  ];

  const { error: imgErr } = await supabase.from("site_images").insert(images);
  if (imgErr) console.error("site_images insert error:", imgErr.message);
  else console.log(`  Inserted ${images.length} images`);

  console.log("Done seeding!");
}

run().catch(console.error);
