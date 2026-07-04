import { MENU, RESTAURANT, birr } from "@/lib/menu";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
// Real photographed ingredient PNGs (sourced from TheMealDB ingredient library).
// These are actual food photos with clean backgrounds — no AI illustrations.
const BUILDER = "/media/builder";
const bunTop = `${BUILDER}/bun-top.png`;
const bunBottom = `${BUILDER}/bun-bottom.png`;
const pattyImg = `${BUILDER}/patty.png`;
const cheeseImg = `${BUILDER}/cheese.png`;
const lettuceImg = `${BUILDER}/lettuce.png`;
const tomatoImg = `${BUILDER}/tomato.png`;
const baconImg = `${BUILDER}/bacon.png`;
const eggImg = `${BUILDER}/egg.png`;
const avocadoImg = `${BUILDER}/avocado.png`;
const onionImg = `${BUILDER}/onion.png`;
const jalapenoImg = `${BUILDER}/jalapeno.png`;
const mushroomImg = `${BUILDER}/mushroom.png`;
const sauceImg = `${BUILDER}/sauce.png`;

/* ============================================================
   LOYALTY HUD — floating "Injoy CLUB" status (localStorage)
   ============================================================ */
const LS_LOYALTY = "Injoy_loyalty_v1";
type Loyalty = { points: number; orders: number };

function readLoyalty(): Loyalty {
  if (typeof window === "undefined") return { points: 0, orders: 0 };
  try {
    return JSON.parse(localStorage.getItem(LS_LOYALTY) ?? "") ?? { points: 0, orders: 0 };
  } catch {
    return { points: 0, orders: 0 };
  }
}
export function awardLoyalty(amountEtb: number) {
  if (typeof window === "undefined") return;
  const cur = readLoyalty();
  const next: Loyalty = {
    points: cur.points + Math.max(10, Math.floor(amountEtb / 50)),
    orders: cur.orders + 1,
  };
  localStorage.setItem(LS_LOYALTY, JSON.stringify(next));
  window.dispatchEvent(new Event("Injoy:loyalty"));
}

function tierFor(points: number) {
  if (points >= 500) return { name: "PLATINUM", color: "from-zinc-300 to-zinc-500" };
  if (points >= 200) return { name: "GOLD", color: "from-amber-300 to-orange-500" };
  if (points >= 50) return { name: "SILVER", color: "from-zinc-200 to-zinc-400" };
  return { name: "ROOKIE", color: "from-orange-500 to-red-600" };
}

export function LoyaltyHud() {
  const [l, setL] = useState<Loyalty>({ points: 0, orders: 0 });
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const sync = () => setL(readLoyalty());
    sync();
    window.addEventListener("Injoy:loyalty", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("Injoy:loyalty", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const tier = tierFor(l.points);
  const nextTier = l.points < 50 ? 50 : l.points < 200 ? 200 : l.points < 500 ? 500 : l.points;
  const pct = Math.min(100, (l.points / nextTier) * 100);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 right-3 z-50 group flex items-center gap-2 rounded-full border border-orange-500/40 bg-black/70 backdrop-blur px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-orange-100 hover:bg-black/90 transition"
        aria-label="Loyalty rewards"
      >
        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${tier.color} animate-pulse`} />
        <span className="font-bold">{tier.name}</span>
        <span className="text-orange-300">· {l.points} pts</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full rounded-2xl border border-orange-500/30 bg-zinc-950 p-6 text-orange-50 shadow-2xl shadow-orange-500/20"
            >
              <div className="text-[10px] uppercase tracking-[0.4em] text-orange-300/70">
                Injoy Club
              </div>
              <div
                className={`mt-1 text-3xl font-black bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}
              >
                {tier.name}
              </div>
              <div className="mt-4 text-sm text-orange-100/80">
                You have <span className="text-orange-300 font-bold">{l.points}</span> points from{" "}
                <span className="text-orange-300 font-bold">{l.orders}</span> order
                {l.orders === 1 ? "" : "s"}.
              </div>
              <div className="mt-3 h-2 rounded-full bg-zinc-900 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${tier.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-orange-300/60">
                {l.points >= 500 ? "Top tier unlocked" : `${nextTier - l.points} pts to next tier`}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <Reward pts={50} label="Free Fries" unlocked={l.points >= 50} />
                <Reward pts={200} label="Free Burger" unlocked={l.points >= 200} />
                <Reward pts={500} label="VIP Table" unlocked={l.points >= 500} />
              </div>
              <button
                onClick={() => setOpen(false)}
                className="mt-5 w-full rounded-md bg-orange-500 hover:bg-orange-400 text-black font-bold py-2 text-xs uppercase tracking-[0.3em]"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Reward({ pts, label, unlocked }: { pts: number; label: string; unlocked: boolean }) {
  return (
    <div
      className={`rounded-lg border p-2 text-[10px] uppercase tracking-widest transition ${
        unlocked
          ? "border-orange-500/60 bg-orange-500/10 text-orange-200"
          : "border-zinc-800 bg-zinc-900 text-zinc-600"
      }`}
    >
      <div className="text-base">{unlocked ? "🔥" : "🔒"}</div>
      <div className="font-bold">{pts}</div>
      <div className="opacity-80">{label}</div>
    </div>
  );
}

/* ============================================================
   LIVE KITCHEN TICKER — scrolling "now cooking" feed
   ============================================================ */
const TICKER_NAMES = [
  "Selam",
  "Dawit",
  "Marta",
  "Kalkidan",
  "Yonas",
  "Bisrat",
  "Hana",
  "Nahom",
  "Liya",
  "Abel",
];
const TICKER_AREAS = [
  "Bole",
  "Kazanchis",
  "Sarbet",
  "CMC",
  "Megenagna",
  "Piassa",
  "Gerji",
  "Old Airport",
];

export function LiveKitchenTicker() {
  const items = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const m = MENU[i % MENU.length];
      const n = TICKER_NAMES[i % TICKER_NAMES.length];
      const a = TICKER_AREAS[i % TICKER_AREAS.length];
      const mins = ((i * 3) % 18) + 1;
      return { id: `${m.id}-${i}`, name: m.name, who: n, area: a, mins };
    });
  }, []);
  return (
    <section className="relative border-y border-orange-500/20 bg-black/80 overflow-hidden py-3">
      <div className="flex items-center gap-3 px-4">
        <span className="shrink-0 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-orange-300">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Live Kitchen
        </span>
        <div className="relative flex-1 overflow-hidden">
          <motion.div
            className="flex gap-10 whitespace-nowrap text-xs text-orange-100/80"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          >
            {[...items, ...items].map((it, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                <span className="text-orange-400">●</span>
                <b className="text-orange-200">{it.who}</b> ordered{" "}
                <span className="text-orange-300">{it.name}</span> · {it.area} · {it.mins}m ago
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SPIN THE WHEEL — daily discount game
   ============================================================ */
const WHEEL = [
  { label: "5% OFF", code: "Injoy5", deg: 0, color: "#f97316" },
  { label: "FREE FRIES", code: "FRIES", deg: 45, color: "#7c2d12" },
  { label: "10% OFF", code: "Injoy10", deg: 90, color: "#ea580c" },
  { label: "TRY AGAIN", code: "", deg: 135, color: "#1c1917" },
  { label: "15% OFF", code: "Injoy15", deg: 180, color: "#fb923c" },
  { label: "FREE COKE", code: "COKE", deg: 225, color: "#7c2d12" },
  { label: "20% OFF", code: "FIRE20", deg: 270, color: "#dc2626" },
  { label: "TRY AGAIN", code: "", deg: 315, color: "#1c1917" },
];
const LS_WHEEL = "Injoy_wheel_v1";

export function SpinWheel({ onCode }: { onCode: (code: string) => void }) {
  const rot = useMotionValue(0);
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [used, setUsed] = useState(false);

  useEffect(() => {
    const last = localStorage.getItem(LS_WHEEL);
    if (last && Date.now() - Number(last) < 24 * 60 * 60 * 1000) setUsed(true);
  }, []);

  const spin = () => {
    if (spinning || used) return;
    setSpinning(true);
    setResult(null);
    const winIdx = Math.floor(Math.random() * WHEEL.length);
    const target = 360 * 6 + (360 - WHEEL[winIdx].deg);
    animate(rot, target, {
      duration: 4.5,
      ease: [0.16, 1, 0.3, 1],
      onComplete: () => {
        setSpinning(false);
        setResult(WHEEL[winIdx].label);
        if (WHEEL[winIdx].code) onCode(WHEEL[winIdx].code);
        localStorage.setItem(LS_WHEEL, String(Date.now()));
        setUsed(true);
      },
    });
  };

  return (
    <section className="relative px-6 py-24 bg-gradient-to-b from-black via-zinc-950 to-black">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-orange-400">Daily Spin</div>
          <h2 className="mt-2 text-5xl md:text-6xl font-black text-orange-50 leading-none">
            FEELING
            <br />
            LUCKY?
          </h2>
          <p className="mt-4 text-orange-100/70 max-w-md">
            One free spin every 24 hours. Land on a discount and we drop the code straight into your
            next order.
          </p>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 inline-block rounded-lg border border-orange-500/50 bg-orange-500/10 px-4 py-3 text-orange-200"
            >
              You won: <b className="text-orange-300">{result}</b>
            </motion.div>
          )}
        </div>
        <div className="relative aspect-square max-w-[420px] mx-auto w-full">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-3xl">▼</div>
          <motion.div
            style={{ rotate: rot }}
            className="absolute inset-0 rounded-full border-4 border-orange-500/40 shadow-2xl shadow-orange-500/30 overflow-hidden"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {WHEEL.map((w, i) => {
                const a1 = ((i * 45 - 90) * Math.PI) / 180;
                const a2 = (((i + 1) * 45 - 90) * Math.PI) / 180;
                const x1 = 100 + 100 * Math.cos(a1);
                const y1 = 100 + 100 * Math.sin(a1);
                const x2 = 100 + 100 * Math.cos(a2);
                const y2 = 100 + 100 * Math.sin(a2);
                const tx = 100 + 60 * Math.cos((a1 + a2) / 2);
                const ty = 100 + 60 * Math.sin((a1 + a2) / 2);
                return (
                  <g key={i}>
                    <path
                      d={`M100,100 L${x1},${y1} A100,100 0 0,1 ${x2},${y2} Z`}
                      fill={w.color}
                      stroke="#000"
                      strokeWidth="1"
                    />
                    <text
                      x={tx}
                      y={ty}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="8"
                      fontWeight="800"
                      fill="#fff"
                      transform={`rotate(${i * 45 + 22.5} ${tx} ${ty})`}
                    >
                      {w.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </motion.div>
          <button
            onClick={spin}
            disabled={spinning || used}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-700 disabled:text-zinc-400 text-black font-black text-xs uppercase tracking-widest shadow-2xl shadow-orange-500/50 transition"
          >
            {used ? "Tomorrow" : spinning ? "..." : "SPIN"}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   DIRECTOR'S CUT — Layered cinematic burger builder
   ============================================================ */

const PATTIES = [
  { id: "single", name: "Single Injoy", price: 450, count: 1 },
  { id: "double", name: "Double Injoy", price: 650, count: 2 },
  { id: "triple", name: "Triple Stack", price: 850, count: 3 },
];
const CHEESES = [
  { id: "none", name: "No Cheese", price: 0 },
  { id: "cheddar", name: "Smoked Cheddar", price: 60 },
  { id: "pepper", name: "Pepper Jack", price: 70 },
  { id: "swiss", name: "Swiss", price: 70 },
];
const TOPPINGS = [
  { id: "bacon", name: "Bacon", price: 90, img: baconImg },
  { id: "egg", name: "Fried Egg", price: 60, img: eggImg },
  { id: "avocado", name: "Avocado", price: 80, img: avocadoImg },
  { id: "onion", name: "Caramel Onion", price: 40, img: onionImg },
  { id: "jalapeno", name: "Jalapeños", price: 30, img: jalapenoImg },
  { id: "mushroom", name: "Mushrooms", price: 50, img: mushroomImg },
];
const SAUCES = [
  { id: "house", name: "House Sauce", price: 0 },
  { id: "bbq", name: "Smoky BBQ", price: 20 },
  { id: "awaze", name: "Awaze Heat", price: 20 },
  { id: "garlic", name: "Garlic Aioli", price: 20 },
];

const SCENES = [
  { id: 0, name: "Base", label: "Scene 1 · The Bun" },
  { id: 1, name: "Protein", label: "Scene 2 · The Patty" },
  { id: 2, name: "Effects", label: "Scene 3 · Toppings" },
  { id: 3, name: "Final Cut", label: "Scene 4 · The Wrap" },
];

export function BuildYourBurger({ onBuilt }: { onBuilt: (name: string, price: number) => void }) {
  const [scene, setScene] = useState(0);
  const [patty, setPatty] = useState(PATTIES[1]);
  const [cheese, setCheese] = useState(CHEESES[1]);
  const [tops, setTops] = useState<string[]>(["bacon"]);
  const [sauce, setSauce] = useState(SAUCES[0]);

  const topItems = TOPPINGS.filter((t) => tops.includes(t.id));
  const total =
    patty.price + cheese.price + sauce.price + topItems.reduce((a, b) => a + b.price, 0);
  const name = `Director's ${patty.name}`;

  // Build the visual stack (top of frame → bottom)
  // Each layer: {key, src, top (%), height (%), z}
  type Layer = { key: string; src: string; top: number; height: number; z: number; tint?: string };
  const layers: Layer[] = [];
  let z = 1;
  // Real photo ingredients are square — we render them at ~32% height
  // and overlap vertically to create an exploded cinematic stack.
  // Bottom bun
  layers.push({ key: "bun-bottom", src: bunBottom, top: 70, height: 32, z: z++ });
  // Sauce drizzle
  layers.push({
    key: `sauce-${sauce.id}`,
    src: sauceImg,
    top: 62,
    height: 18,
    z: z++,
    tint:
      sauce.id === "awaze"
        ? "hue-rotate(-25deg) saturate(2)"
        : sauce.id === "bbq"
          ? "hue-rotate(-15deg) sepia(0.6) brightness(0.85)"
          : sauce.id === "garlic"
            ? "saturate(0.2) brightness(1.2)"
            : undefined,
  });
  // Tomato slice
  layers.push({ key: "tomato", src: tomatoImg, top: 52, height: 24, z: z++ });
  // Lettuce
  layers.push({ key: "lettuce", src: lettuceImg, top: 44, height: 26, z: z++ });
  // Patty stack with cheese melted between
  const pattyStartTop = 28;
  const pattyStep = 8;
  for (let i = 0; i < patty.count; i++) {
    layers.push({
      key: `patty-${i}`,
      src: pattyImg,
      top: pattyStartTop + i * pattyStep,
      height: 24,
      z: z++,
    });
    if (cheese.id !== "none") {
      layers.push({
        key: `cheese-${i}-${cheese.id}`,
        src: cheeseImg,
        top: pattyStartTop + i * pattyStep - 3,
        height: 22,
        z: z++,
        tint:
          cheese.id === "pepper"
            ? "hue-rotate(-35deg) saturate(1.4)"
            : cheese.id === "swiss"
              ? "saturate(0.3) brightness(1.2)"
              : undefined,
      });
    }
  }
  // Toppings above the patty
  topItems.forEach((t, idx) => {
    layers.push({ key: `top-${t.id}`, src: t.img, top: 18 - idx * 3, height: 20, z: z++ });
  });
  // Top bun
  layers.push({ key: "bun-top", src: bunTop, top: -2, height: 34, z: z++ });

  return (
    <section
      id="build"
      className="relative px-6 py-24 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden"
    >
      {/* spotlight */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="relative max-w-6xl mx-auto">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-orange-400">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Now Filming · Take 01
        </div>
        <h2 className="mt-2 text-5xl md:text-7xl font-black text-orange-50 leading-none">
          DIRECTOR&apos;S <span className="text-orange-500">CUT</span>
        </h2>
        <p className="mt-3 max-w-md text-sm text-orange-100/60 italic">
          Craft your masterpiece — one scene at a time.
        </p>

        <div className="mt-12 grid lg:grid-cols-[380px_1fr] gap-10">
          {/* CONTROLS */}
          <div className="space-y-6">
            {/* Scene tabs */}
            <div className="flex gap-1 border-b border-orange-500/20 pb-3">
              {SCENES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScene(s.id)}
                  className={`text-[10px] uppercase tracking-[0.2em] px-3 py-2 font-bold transition ${
                    scene === s.id
                      ? "text-orange-400 border-b-2 border-orange-500"
                      : "text-orange-100/40 hover:text-orange-200"
                  }`}
                >
                  0{s.id + 1}
                </button>
              ))}
            </div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-orange-300">
              {SCENES[scene].label}
            </div>

            {scene === 0 && (
              <Group label="Sauce — the foundation">
                {SAUCES.map((s) => (
                  <Chip key={s.id} active={sauce.id === s.id} onClick={() => setSauce(s)}>
                    {s.name}
                    {s.price ? ` · +${s.price}` : ""}
                  </Chip>
                ))}
              </Group>
            )}
            {scene === 1 && (
              <>
                <Group label="Patty">
                  {PATTIES.map((p) => (
                    <Chip key={p.id} active={patty.id === p.id} onClick={() => setPatty(p)}>
                      {p.name} · {p.price} ETB
                    </Chip>
                  ))}
                </Group>
                <Group label="Cheese">
                  {CHEESES.map((c) => (
                    <Chip key={c.id} active={cheese.id === c.id} onClick={() => setCheese(c)}>
                      {c.name}
                      {c.price ? ` · +${c.price}` : ""}
                    </Chip>
                  ))}
                </Group>
              </>
            )}
            {scene === 2 && (
              <Group label="Add effects">
                {TOPPINGS.map((t) => {
                  const on = tops.includes(t.id);
                  return (
                    <Chip
                      key={t.id}
                      active={on}
                      onClick={() =>
                        setTops((cur) => (on ? cur.filter((x) => x !== t.id) : [...cur, t.id]))
                      }
                    >
                      {on ? "✓ " : "+ "}
                      {t.name} · +{t.price}
                    </Chip>
                  );
                })}
              </Group>
            )}
            {scene === 3 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-orange-500/30 bg-zinc-950/60 p-5">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-orange-300">
                    Final Cast
                  </div>
                  <ul className="mt-3 space-y-1.5 text-sm text-orange-100/85">
                    <li className="flex justify-between">
                      <span>· {patty.name}</span>
                      <span className="text-orange-300/70">{patty.price} ETB</span>
                    </li>
                    {cheese.id !== "none" && (
                      <li className="flex justify-between">
                        <span>· {cheese.name}</span>
                        <span className="text-orange-300/70">+{cheese.price}</span>
                      </li>
                    )}
                    {topItems.map((t) => (
                      <li key={t.id} className="flex justify-between">
                        <span>· {t.name}</span>
                        <span className="text-orange-300/70">+{t.price}</span>
                      </li>
                    ))}
                    <li className="flex justify-between">
                      <span>· {sauce.name}</span>
                      <span className="text-orange-300/70">
                        {sauce.price ? `+${sauce.price}` : "free"}
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-orange-300/60">
                      Total
                    </div>
                    <div className="text-4xl font-black text-orange-300">{birr(total)}</div>
                  </div>
                  <button
                    onClick={() => onBuilt(name, total)}
                    className="rounded-md bg-orange-500 hover:bg-orange-400 text-black font-black px-6 py-3 text-xs uppercase tracking-[0.3em] shadow-lg shadow-orange-500/30"
                  >
                    🎬 That&apos;s a Wrap
                  </button>
                </div>
              </div>
            )}

            {/* nav */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setScene((s) => Math.max(0, s - 1))}
                disabled={scene === 0}
                className="text-[10px] uppercase tracking-[0.3em] px-4 py-2 border border-orange-500/30 text-orange-200 disabled:opacity-30 hover:bg-orange-500/10"
              >
                ← Prev Scene
              </button>
              <button
                onClick={() => setScene((s) => Math.min(3, s + 1))}
                disabled={scene === 3}
                className="text-[10px] uppercase tracking-[0.3em] px-4 py-2 bg-orange-500 text-black font-bold disabled:opacity-30"
              >
                Next Scene →
              </button>
            </div>
          </div>

          {/* STAGE */}
          <div className="relative">
            <div className="lg:sticky lg:top-24">
              {/* film frame */}
              <div className="relative aspect-square max-w-[560px] mx-auto rounded-2xl border border-orange-500/20 bg-gradient-to-b from-zinc-900 via-black to-zinc-950 overflow-hidden shadow-2xl shadow-orange-500/10">
                {/* corner brackets */}
                <span className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-orange-400/60" />
                <span className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-orange-400/60" />
                <span className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-orange-400/60" />
                <span className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-orange-400/60" />
                {/* timecode */}
                <div className="absolute top-4 right-6 text-[9px] font-mono tracking-widest text-orange-300/70 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> REC · SCENE
                  0{scene + 1}
                </div>
                {/* ground shadow */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[12%] w-[70%] h-6 rounded-[50%] bg-black/60 blur-xl" />

                {/* LAYER STACK */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[88%] aspect-square">
                    <AnimatePresence>
                      {layers.map((l) => (
                        <motion.img
                          key={l.key}
                          src={l.src}
                          alt=""
                          initial={{ y: -260, opacity: 0, scale: 1.05, rotate: -3 }}
                          animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ y: 80, opacity: 0, scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.7 }}
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: `${l.top}%`,
                            height: `${l.height * 1.6}%`,
                            transform: "translateX(-50%)",
                            zIndex: l.z,
                            filter: l.tint
                              ? `${l.tint} drop-shadow(0 6px 8px rgba(0,0,0,0.5))`
                              : "drop-shadow(0 6px 8px rgba(0,0,0,0.5))",
                            objectFit: "contain",
                            maxWidth: "100%",
                            width: "auto",
                          }}
                          draggable={false}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* film grain */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")",
                  }}
                />
                {/* vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.7) 100%)",
                  }}
                />

                {/* bottom label */}
                <div className="absolute left-6 bottom-5 right-6 flex items-end justify-between">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.4em] text-orange-300/70">
                      Now Showing
                    </div>
                    <div className="text-xl font-black text-orange-50 leading-tight">{name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] uppercase tracking-[0.4em] text-orange-300/70">
                      Running Total
                    </div>
                    <div className="text-2xl font-black text-orange-300">{birr(total)}</div>
                  </div>
                </div>
              </div>

              {/* film strip */}
              <div className="mt-4 flex gap-1 max-w-[560px] mx-auto">
                {SCENES.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setScene(s.id)}
                    className={`flex-1 h-1.5 rounded-full cursor-pointer transition ${
                      scene >= s.id ? "bg-orange-500" : "bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.4em] text-orange-400 mb-3">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-2 rounded-full border transition ${
        active
          ? "border-orange-500 bg-orange-500 text-black font-bold"
          : "border-zinc-700 bg-zinc-900 text-orange-100/80 hover:border-orange-500/50"
      }`}
    >
      {children}
    </button>
  );
}

/* ============================================================
   GIFT CARDS
   ============================================================ */
const GIFTS = [500, 1000, 2500, 5000];
export function GiftCards({ onGift }: { onGift: (amount: number) => void }) {
  return (
    <section className="relative px-6 py-24 bg-gradient-to-b from-black to-zinc-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-[10px] uppercase tracking-[0.4em] text-orange-400">Give Injoy</div>
        <h2 className="mt-2 text-5xl md:text-7xl font-black text-orange-50 leading-none">
          GIFT <span className="text-orange-500">CARDS</span>
        </h2>
        <p className="mt-4 text-orange-100/70 max-w-xl">
          Send a flame-wrapped voucher to anyone in Addis. Delivered by WhatsApp in seconds.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {GIFTS.map((amt, i) => (
            <motion.button
              key={amt}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => onGift(amt)}
              className="group relative aspect-[3/2] rounded-xl overflow-hidden text-left p-5 border border-orange-500/30 bg-gradient-to-br from-orange-600 via-red-700 to-zinc-950 shadow-xl shadow-black/60"
            >
              <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_20%_20%,#fff,transparent_50%)]" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="text-[10px] uppercase tracking-[0.4em] text-orange-100/80">
                  Injoy · GIFT
                </div>
                <div>
                  <div className="text-4xl font-black text-white drop-shadow-lg">{amt} ETB</div>
                  <div className="text-[11px] uppercase tracking-widest text-orange-100/80 mt-1">
                    Tap to send →
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function sendGiftWhatsApp(amount: number) {
  const msg =
    `🔥 Injoy BURGERS Gift Card%0A%0A` +
    `Amount: ${amount} ETB%0A` +
    `From: ____________%0A` +
    `To: ____________%0A` +
    `Message: ____________%0A%0A` +
    `Reply YES to confirm purchase.`;
  window.open(`https://wa.me/${RESTAURANT.whatsapp}?text=${msg}`, "_blank");
}

/* ============================================================
   CATERING INQUIRY
   ============================================================ */
export function Catering() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [size, setSize] = useState("50");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const msg =
      `🍔 CATERING REQUEST%0A%0A` +
      `Name: ${name}%0APhone: ${phone}%0AGuests: ${size}%0ADate: ${date}%0ANotes: ${note}`;
    window.open(`https://wa.me/${RESTAURANT.whatsapp}?text=${msg}`, "_blank");
  };
  return (
    <section className="relative px-6 py-24 bg-black border-t border-orange-500/10">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        <div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-orange-400">
            Events · Office · Weddings
          </div>
          <h2 className="mt-2 text-5xl md:text-6xl font-black text-orange-50 leading-none">
            CATERING
            <br />
            ON FIRE
          </h2>
          <p className="mt-4 text-orange-100/70 max-w-md">
            From 50-guest office launches to 500-person weddings — we bring the Injoy grill, the
            smoke, and the crew.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-orange-100/80">
            <li>· Mobile Injoy grill setup</li>
            <li>· Live cooking station</li>
            <li>· Vegetarian & vegan options</li>
            <li>· Full crew & cleanup</li>
          </ul>
        </div>
        <form
          onSubmit={submit}
          className="rounded-2xl border border-orange-500/30 bg-zinc-950 p-6 space-y-3"
        >
          <Input label="Your name" value={name} onChange={setName} required />
          <Input label="Phone" value={phone} onChange={setPhone} required placeholder="09…" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Guests" value={size} onChange={setSize} required />
            <Input label="Date" value={date} onChange={setDate} required placeholder="DD/MM/YYYY" />
          </div>
          <Input label="Notes" value={note} onChange={setNote} placeholder="Venue, menu, etc." />
          <button className="w-full rounded-md bg-orange-500 hover:bg-orange-400 text-black font-black py-3 text-xs uppercase tracking-[0.3em]">
            Send Inquiry · WhatsApp
          </button>
        </form>
      </div>
    </section>
  );
}
function Input({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-orange-300/70">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm text-orange-50 placeholder-zinc-600 focus:outline-none focus:border-orange-500"
      />
    </label>
  );
}

/* ============================================================
   PROMO CODE input
   ============================================================ */
const PROMO_MAP: Record<string, { off: number; label: string }> = {
  Injoy5: { off: 0.05, label: "5% off" },
  Injoy10: { off: 0.1, label: "10% off" },
  Injoy15: { off: 0.15, label: "15% off" },
  FIRE20: { off: 0.2, label: "20% off" },
  FRIES: { off: 0, label: "Free fries on us" },
  COKE: { off: 0, label: "Free Coke on us" },
};
export function usePromo() {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; off: number; label: string } | null>(null);
  const apply = (raw?: string) => {
    const c = (raw ?? code).trim().toUpperCase();
    const hit = PROMO_MAP[c];
    if (hit) setApplied({ code: c, ...hit });
    else setApplied(null);
  };
  return { code, setCode, applied, apply, clear: () => setApplied(null) };
}

export function PromoInput({ code, setCode, applied, apply }: ReturnType<typeof usePromo>) {
  return (
    <div className="rounded-md border border-orange-500/30 bg-black p-3">
      <div className="text-[10px] uppercase tracking-[0.3em] text-orange-300/70 mb-2">
        Promo Code
      </div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Injoy10"
          className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-orange-50 uppercase tracking-wider placeholder-zinc-600 focus:outline-none focus:border-orange-500"
        />
        <button
          type="button"
          onClick={() => apply()}
          className="rounded-md bg-orange-500 hover:bg-orange-400 text-black font-bold px-4 text-xs uppercase tracking-widest"
        >
          Apply
        </button>
      </div>
      {applied && (
        <div className="mt-2 text-xs text-orange-300">
          ✓ {applied.code} — {applied.label}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SHARE BAR — native share + social fallbacks
   ============================================================ */
export function ShareBar() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const title = "Injoy BURGERS — Addis Ababa";
  const text = "Check out the best Injoy burgers in Addis Ababa! 🔥🍔";

  const openMenu = () => setOpen((v) => !v);
  const closeMenu = () => setOpen(false);

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        closeMenu();
        return;
      } catch {}
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Copy this link:", url);
    }
    closeMenu();
  };

  const shareTo = (platform: string) => {
    const u = encodeURIComponent(url);
    const txt = encodeURIComponent(text);
    let href = "#";
    if (platform === "whatsapp") href = `https://wa.me/?text=${txt}%20${u}`;
    else if (platform === "telegram") href = `https://t.me/share/url?url=${u}&text=${txt}`;
    else if (platform === "x") href = `https://twitter.com/intent/tweet?text=${txt}&url=${u}`;
    else if (platform === "facebook") href = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    else if (platform === "instagram") href = "https://www.instagram.com/";
    else if (platform === "tiktok") href = "https://www.tiktok.com/";
    window.open(href, "_blank", "width=600,height=500");
    setOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-3 z-50">
      <button
        onClick={openMenu}
        className="rounded-full border border-orange-500/40 bg-black/80 backdrop-blur px-4 py-2.5 text-[10px] uppercase tracking-[0.3em] text-orange-200 hover:bg-orange-500 hover:text-black transition shadow-lg shadow-black/40"
        aria-label="Share"
      >
        {copied ? "✓ Copied!" : "↗ Share"}
      </button>

      {open && (
        <div className="absolute bottom-14 right-0 bg-zinc-950 border border-orange-500/30 rounded-xl p-2 flex flex-col gap-1 shadow-2xl shadow-black/60 min-w-[180px]">
          {typeof navigator.share !== "undefined" && (
            <button
              onClick={shareNative}
              className="flex items-center gap-2 px-3 py-2 text-xs text-orange-100 hover:bg-orange-500/10 rounded-lg transition"
            >
              <ShareIcon name="share" /> System Share
            </button>
          )}
          <button
            onClick={() => shareTo("whatsapp")}
            className="flex items-center gap-2 px-3 py-2 text-xs text-orange-100 hover:bg-orange-500/10 rounded-lg transition"
          >
            <ShareIcon name="whatsapp" /> WhatsApp
          </button>
          <button
            onClick={() => shareTo("telegram")}
            className="flex items-center gap-2 px-3 py-2 text-xs text-orange-100 hover:bg-orange-500/10 rounded-lg transition"
          >
            <ShareIcon name="telegram" /> Telegram
          </button>
          <button
            onClick={() => shareTo("x")}
            className="flex items-center gap-2 px-3 py-2 text-xs text-orange-100 hover:bg-orange-500/10 rounded-lg transition"
          >
            <ShareIcon name="x" /> X / Twitter
          </button>
          <button
            onClick={() => shareTo("facebook")}
            className="flex items-center gap-2 px-3 py-2 text-xs text-orange-100 hover:bg-orange-500/10 rounded-lg transition"
          >
            <ShareIcon name="facebook" /> Facebook
          </button>
          <button
            onClick={() => shareTo("instagram")}
            className="flex items-center gap-2 px-3 py-2 text-xs text-orange-100 hover:bg-orange-500/10 rounded-lg transition"
          >
            <ShareIcon name="instagram" /> Instagram
          </button>
          <button
            onClick={() => shareTo("tiktok")}
            className="flex items-center gap-2 px-3 py-2 text-xs text-orange-100 hover:bg-orange-500/10 rounded-lg transition"
          >
            <ShareIcon name="tiktok" /> TikTok
          </button>
          <div className="h-px bg-orange-500/20 my-1" />
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-3 py-2 text-xs text-orange-100 hover:bg-orange-500/10 rounded-lg transition"
          >
            <ShareIcon name="copy" /> Copy Link
          </button>
        </div>
      )}
    </div>
  );
}

function ShareIcon({ name }: { name: string }) {
  const cls = "w-4 h-4 shrink-0";
  if (name === "whatsapp")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    );
  if (name === "telegram")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    );
  if (name === "x")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  if (name === "facebook")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  if (name === "instagram")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    );
  if (name === "tiktok")
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z" />
      </svg>
    );
  if (name === "copy")
    return (
      <svg
        className={cls}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
    );
  if (name === "share")
    return (
      <svg
        className={cls}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    );
  return null;
}
