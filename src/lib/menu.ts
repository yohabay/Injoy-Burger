// Real customer photos pulled from the Injoy BURGERS Google Maps listing
// and compressed locally so menu cards render instantly with zero wait.
const bbqImg = "/media/google/Injoy-g0.jpg";
const tripleImg = "/media/google/Injoy-g1.jpg";
const malmoImg = "/media/google/Injoy-g2.jpg";
const chiliImg = "/media/google/Injoy-g3.jpg";
const hillbillyImg = "/media/google/Injoy-g4.jpg";
const beefImg = "/media/google/Injoy-g5.jpg";
const loqitoImg = "/media/google/Injoy-g6.jpg";
const sausageImg = "/media/google/Injoy-g7.jpg";

const HERO_VIDEO_SRC = "/media/hero-cinematic.mp4";
const PIZZA_VIDEO_SRC = "/media/pizza-making.mp4";
const EATING_VIDEO_SRC = "/media/eating-burger.mp4";

export type MenuItem = {
  id: string;
  number: string;
  name: string;
  tag: string;
  desc: string;
  price: number; // ETB
  img: string;
  video?: string;
  category: "Most Ordered" | "Main Dish";
};

export const MENU: MenuItem[] = [
  {
    id: "bbq-cheese",
    number: "01",
    name: "BBQ Cheese Burger",
    tag: "Signature · Smoky",
    desc: "House BBQ glaze, smoked cheddar, crispy onions, brioche.",
    price: 770.5,
    img: bbqImg,
    video: HERO_VIDEO_SRC,
    category: "Most Ordered",
  },
  {
    id: "triple",
    number: "02",
    name: "Triple Burger",
    tag: "Triple Stack",
    desc: "Three Injoy patties, American cheese, secret sauce.",
    price: 943,
    img: tripleImg,
    video: EATING_VIDEO_SRC,
    category: "Most Ordered",
  },
  {
    id: "malmo",
    number: "03",
    name: "Malmo Injoy",
    tag: "House Favourite",
    desc: "Double Injoy, caramelised onion jam, mustard mayo.",
    price: 874,
    img: malmoImg,
    video: HERO_VIDEO_SRC,
    category: "Most Ordered",
  },
  {
    id: "chili",
    number: "04",
    name: "Chili Burger",
    tag: "Spicy · Awaze heat",
    desc: "Berbere chili glaze, jalapeños, pepper jack, lime crema.",
    price: 759,
    img: chiliImg,
    video: PIZZA_VIDEO_SRC,
    category: "Most Ordered",
  },
  {
    id: "hillbilly",
    number: "05",
    name: "Hillbilly BBQ Burger",
    tag: "Smokehouse",
    desc: "Bacon, onion rings, BBQ, smoked cheddar, toasted bun.",
    price: 897,
    img: hillbillyImg,
    video: EATING_VIDEO_SRC,
    category: "Main Dish",
  },
  {
    id: "beef",
    number: "06",
    name: "Beef Burger",
    tag: "Classic",
    desc: "Single Injoy patty, cheese, pickles, house sauce.",
    price: 724.5,
    img: beefImg,
    video: HERO_VIDEO_SRC,
    category: "Main Dish",
  },
  {
    id: "loqito",
    number: "07",
    name: "Loqito Bandito",
    tag: "Tex-Mex",
    desc: "Injoy patty, guacamole, salsa roja, crispy tortilla, jack.",
    price: 874,
    img: loqitoImg,
    video: PIZZA_VIDEO_SRC,
    category: "Main Dish",
  },
  {
    id: "sausage",
    number: "08",
    name: "Sausage Burger",
    tag: "Hearty",
    desc: "Bratwurst, melted Swiss, mustard, sauerkraut, pretzel bun.",
    price: 782,
    img: sausageImg,
    video: EATING_VIDEO_SRC,
    category: "Main Dish",
  },
];

export const RESTAURANT = {
  name: "Injoy BURGERS",
  address: "Namibia St, 2Q2M+4H, Bole, Addis Ababa",
  lat: 9.0002479,
  lng: 38.7839168,
  whatsapp: "251962629663", // E.164 without +
  hours: "11:30 — 22:30 · Mon — Sun",
};

export function birr(n: number) {
  return `ETB ${n.toLocaleString("en-ET", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
}
