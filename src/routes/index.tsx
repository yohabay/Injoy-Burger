import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { MENU, RESTAURANT, birr, type MenuItem } from "@/lib/menu";
import { bookTable, placeOrder } from "@/lib/orders.functions";

import heroBurger from "@/assets/hero-burger.jpg";
import riderImg from "@/assets/rider.jpg";
import tripleImg from "@/assets/triple-burger.jpg";
import {
  Catering,
  LiveKitchenTicker,
  LoyaltyHud,
  ShareBar,
  SpinWheel,
  awardLoyalty,
} from "@/components/Features";
import { GoogleReel } from "@/components/GoogleReel";
import { MovieStory } from "@/components/MovieStory";

const HERO_VIDEO_SRC = "/media/hero-cinematic.mp4";
const EATING_VIDEO_SRC = "/media/eating-burger.mp4";
const RIDER_VIDEO_SRC = "/media/rider-ride.mp4";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Injoy BURGERS — Addis Ababa · Bole · Order & Book" },
      {
        name: "description",
        content:
          "Injoy BURGERS, Bole — handcrafted Injoy patties, smoky BBQ, signature ETB menu. Order online or reserve a table in Addis Ababa.",
      },
      { property: "og:title", content: "Injoy BURGERS — Addis Ababa" },
      {
        property: "og:description",
        content:
          "Cinematic ordering experience. Injoy patties, BBQ, chili, sausage — straight from Bole.",
      },
      { property: "og:image", content: tripleImg },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: tripleImg },
    ],
  }),
  component: Index,
});

/* ============================================================
   ROOT
   ============================================================ */
function Index() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<"choose" | "order" | "book" | "done">("choose");
  const [lastResult, setLastResult] = useState<{
    id: string;
    waLink: string;
    teLink: string;
  } | null>(null);

  const addToCart = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const removeFromCart = (id: string) =>
    setCart((c) => {
      const n = { ...c };
      if (!n[id]) return n;
      n[id] -= 1;
      if (n[id] <= 0) delete n[id];
      return n;
    });
  const clearCart = () => setCart({});

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce(
    (sum, [id, q]) => sum + (MENU.find((m) => m.id === id)?.price ?? 0) * q,
    0,
  );

  const openCheckout = (mode: "choose" | "order" | "book" = "choose") => {
    setCheckoutMode(mode);
    setCheckoutOpen(true);
  };

  return (
    <main className="bg-background text-foreground font-body overflow-x-clip relative">
      <CursorFX />
      <FilmGrain />
      <LoyaltyHud />
      <ShareBar />
      <TopBar cartCount={cartCount} onOpenBook={() => openCheckout("book")} />
      <LiveKitchenTicker />
      <HeroCinema onOrder={() => openCheckout("choose")} />
      <MovieStory onOrder={() => openCheckout("order")} onBook={() => openCheckout("book")} />
      <Manifesto />
      <MenuSection cart={cart} onAdd={addToCart} />

      <RiderCam />
      <MapFlyTo />
      <StatsCounter />
      <SpinWheel
        onCode={(code) => {
          try {
            localStorage.setItem("Injoy_promo", code);
          } catch {}
        }}
      />
      <SlowMoCheesePull />
      <GoogleReel />

      <Catering />
      <Reserve onReserve={() => openCheckout("book")} />
      <FooterStrip />

      <CartDock
        cart={cart}
        total={cartTotal}
        count={cartCount}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onCheckout={() => openCheckout("order")}
      />
      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutScene
            mode={checkoutMode}
            setMode={setCheckoutMode}
            cart={cart}
            total={cartTotal}
            lastResult={lastResult}
            onClose={() => {
              setCheckoutOpen(false);
              setTimeout(() => {
                setCheckoutMode("choose");
                setLastResult(null);
              }, 400);
            }}
            onPlaced={(r) => {
              setLastResult(r);
              clearCart();
              setCheckoutMode("done");
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

/* ============================================================
   CURSOR + GRAIN
   ============================================================ */
function CursorFX() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { damping: 30, stiffness: 200, mass: 0.4 });
  const sy = useSpring(y, { damping: 30, stiffness: 200, mass: 0.4 });
  const tx = useSpring(x, { damping: 60, stiffness: 80, mass: 1 });
  const ty = useSpring(y, { damping: 60, stiffness: 80, mass: 1 });
  const [hot, setHot] = useState(false);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setHot(!!t?.closest?.("[data-hot]"));
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <motion.div
        style={{
          x: tx,
          y: ty,
          translateX: "-50%",
          translateY: "-50%",
          opacity: hot ? 0.9 : 0.35,
          scale: hot ? 1.4 : 1,
        }}
        transition={{ opacity: { duration: 0.4 }, scale: { duration: 0.4 } }}
        className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full mix-blend-screen blur-3xl"
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,140,60,0.55),rgba(255,80,30,0.18)_40%,transparent_70%)]" />
      </motion.div>
      <motion.div
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
        className="absolute left-0 top-0 h-[2px] w-40 mix-blend-screen"
      >
        <div className="h-full w-full bg-gradient-to-r from-transparent via-orange-300/90 to-transparent blur-[1px]" />
      </motion.div>
      <motion.div
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
        className="absolute left-0 top-0 h-2 w-2 rounded-full bg-orange-200 shadow-[0_0_20px_8px_rgba(255,160,80,0.55)] mix-blend-screen"
      />
    </div>
  );
}

function FilmGrain() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[55] mix-blend-overlay opacity-[0.10]">
      <div className="absolute inset-0 grain" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.75)_100%)]" />
    </div>
  );
}

/* ============================================================
   TOP BAR
   ============================================================ */
function TopBar({ cartCount, onOpenBook }: { cartCount: number; onOpenBook: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-6 py-5 mix-blend-difference text-white">
      <span className="font-display text-xl uppercase tracking-[0.3em]">Injoy</span>
      <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.4em]">
        <a href="#menu">Menu</a>
        <a href="#find">Find</a>
        <button type="button" onClick={onOpenBook}>
          Book
        </button>
        <a href="#cart">Cart{cartCount > 0 ? ` · ${cartCount}` : ""}</a>
      </div>
    </header>
  );
}

/* ============================================================
   HERO  — parallax mouse layers
   ============================================================ */
function HeroCinema({ onOrder }: { onOrder: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.6, 0]);
  const barH = useTransform(scrollYProgress, [0, 0.4], ["6vh", "0vh"]);

  // mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { damping: 25, stiffness: 90 });
  const py = useSpring(my, { damping: 25, stiffness: 90 });
  useEffect(() => {
    const fn = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mx.set((e.clientX / w - 0.5) * 2);
      my.set((e.clientY / h - 0.5) * 2);
    };
    window.addEventListener("pointermove", fn);
    return () => window.removeEventListener("pointermove", fn);
  }, [mx, my]);
  const smokeX = useTransform(px, (v) => v * 8);
  const smokeY = useTransform(py, (v) => v * 8);
  const burgerX = useTransform(px, (v) => v * 22);
  const burgerY = useTransform(py, (v) => v * 22);
  const glowX = useTransform(px, (v) => v * 50);
  const glowY = useTransform(py, (v) => v * 50);

  return (
    <section ref={ref} data-hot className="relative h-[100svh] w-full overflow-hidden">
      {/* smoke / atmosphere layer */}
      <motion.div
        style={{ x: smokeX, y: smokeY, scale, opacity: 0.45 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,rgba(255,120,40,0.35),transparent_55%),radial-gradient(circle_at_70%_30%,rgba(255,60,20,0.25),transparent_60%)]"
      />
      {/* video / burger layer */}
      <motion.div style={{ scale, y: burgerY, x: burgerX }} className="absolute inset-0">
        <video
          src={HERO_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          poster={heroBurger}
          className="w-full h-full object-cover"
        />
        <img
          src={heroBurger}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/40" />
      </motion.div>
      {/* glowing ember layer (fast) */}
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="absolute inset-0 pointer-events-none mix-blend-screen"
      >
        <div className="absolute left-[12%] top-[60%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,180,80,0.7),transparent_70%)] blur-2xl" />
        <div className="absolute right-[15%] top-[20%] h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,100,40,0.55),transparent_70%)] blur-2xl" />
      </motion.div>

      {/* letterbox bars */}
      <motion.div
        style={{ height: barH, y }}
        className="absolute top-0 left-0 right-0 bg-background z-20"
      />
      <motion.div
        style={{ height: barH }}
        className="absolute bottom-0 left-0 right-0 bg-background z-20"
      />

      <motion.div
        style={{ opacity }}
        className="absolute inset-0 z-10 flex flex-col justify-end p-6 pb-16"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.2 }}
          className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent mb-4"
        >
          ADDIS · BOLE · 2Q2M+4H
        </motion.p>
        <h1 className="font-display text-[68px] leading-[0.85] uppercase tracking-tighter">
          <RevealWord delay={0.8}>Injoy</RevealWord>
          <br />
          <RevealWord delay={1.1}>
            <span className="text-accent">BURGERS</span>
          </RevealWord>
        </h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1.4 }}
          className="mt-8 flex justify-between items-end gap-4"
        >
          <p className="max-w-[22ch] text-xs text-muted-foreground leading-relaxed">
            Hand-pressed patties, Injoyed on a screaming flat-top. Scroll for the menu.
          </p>
          <button
            type="button"
            onClick={onOrder}
            className="font-mono text-[10px] uppercase tracking-[0.4em] border border-accent/60 text-accent px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Order Now
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}

function RevealWord({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ delay, duration: 1, ease: [0.32, 0.72, 0, 1] }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </span>
  );
}

/* ============================================================
   MANIFESTO
   ============================================================ */
function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "end 0.5"] });
  const words =
    "Beef · pressed thin · seared dark · stacked tall · served fast · eaten loud.".split(" ");
  return (
    <section ref={ref} className="relative px-6 py-24">
      <img
        src={tripleImg}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-[0.08]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <p className="relative font-serif italic text-3xl leading-tight text-balance">
        {words.map((w, i) => (
          <ManifestoWord key={i} progress={scrollYProgress} index={i} total={words.length}>
            {w}{" "}
          </ManifestoWord>
        ))}
      </p>
    </section>
  );
}

function ManifestoWord({
  children,
  progress,
  index,
  total,
}: {
  children: React.ReactNode;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  index: number;
  total: number;
}) {
  const start = (index / total) * 0.7;
  const end = start + 0.2;
  const opacity = useTransform(progress, [start, end], [0.18, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

/* ============================================================
   MENU
   ============================================================ */
function MenuSection({
  cart,
  onAdd,
}: {
  cart: Record<string, number>;
  onAdd: (id: string) => void;
}) {
  const categories: MenuItem["category"][] = ["Most Ordered", "Main Dish"];
  return (
    <section id="menu" className="relative px-6 py-24">
      <div className="flex justify-between items-baseline mb-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent">
            The Menu · Tonight's Cast
          </p>
          <h2 className="font-display text-5xl uppercase tracking-tight mt-2">
            Hand-Injoyed.
            <br />
            Fire-Sealed.
          </h2>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hidden sm:block">
          Tap to order
        </p>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              {cat}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {MENU.filter((m) => m.category === cat).map((item, i) => (
              <MenuCard
                key={item.id}
                item={item}
                index={i}
                qty={cart[item.id] ?? 0}
                onAdd={onAdd}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function MenuCard({
  item,
  index,
  qty,
  onAdd,
}: {
  item: MenuItem;
  index: number;
  qty: number;
  onAdd: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const imageSrc = item.img; // real local Google photo, instant load
  const videoSrc = item.video ?? null;

  useEffect(() => {
    if (!ref.current || shouldLoadVideo) return;
    const node = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [shouldLoadVideo]);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  return (
    <motion.div
      ref={ref}
      data-hot
      onPointerMove={handleMove}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, delay: index * 0.06, ease: [0.32, 0.72, 0, 1] }}
      className="relative group overflow-hidden border border-border bg-card"
    >
      <motion.div
        aria-hidden
        style={{
          x: mx,
          y: my,
          translateX: "-50%",
          translateY: "-50%",
          opacity: hover ? 0.55 : 0,
        }}
        transition={{ opacity: { duration: 0.4 } }}
        className="pointer-events-none absolute left-0 top-0 h-[280px] w-[280px] rounded-full mix-blend-screen blur-2xl bg-[radial-gradient(circle,rgba(255,140,60,0.7),transparent_65%)] z-10"
      />

      <div className="relative aspect-[16/10] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,hsl(var(--card))_0%,rgba(255,122,43,0.16)_45%,hsl(var(--card))_90%)] animate-pulse" />
        <img
          src={imageSrc}
          alt={item.name}
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
          width={1280}
          height={800}
          className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-[1200ms] group-hover:scale-110"
        />
        {videoSrc && !videoFailed && shouldLoadVideo && (
          <video
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={imageSrc}
            onLoadedData={() => setVideoReady(true)}
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
            className={`absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-all duration-[1200ms] ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        <div className="absolute top-3 left-4 font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
          {item.number} · {item.tag}
        </div>
      </div>

      <div className="relative p-5 z-20">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-2xl uppercase leading-none">{item.name}</h3>
          <span className="font-mono text-sm text-accent whitespace-nowrap">
            {birr(item.price)}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onAdd(item.id)}
          type="button"
          className="mt-4 w-full py-3 bg-accent text-accent-foreground font-mono text-[11px] uppercase tracking-[0.3em] relative overflow-hidden"
        >
          <span className="relative z-10">
            {qty > 0 ? `Add another · ${qty} in cart` : "Add to order"}
          </span>
          <motion.span
            aria-hidden
            initial={{ x: "-120%" }}
            animate={{ x: hover ? "120%" : "-120%" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ============================================================
   SCENE WIPE — orange radial mask between sections
   ============================================================ */
function SceneWipe() {
  return (
    <div className="relative h-[20vh] overflow-hidden">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 6, opacity: [0, 1, 0] }}
        viewport={{ once: true, margin: "-30%" }}
        transition={{ duration: 1.4, ease: [0.32, 0.72, 0, 1] }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,140,60,0.95),rgba(255,80,30,0.3)_40%,transparent_70%)] blur-2xl"
      />
      <div className="absolute inset-0 grain opacity-20 mix-blend-overlay" />
    </div>
  );
}

/* ============================================================
   EMBEDDED MAP — cinematic scroll zoom + animated delivery ride
   ============================================================ */

function MapFlyTo() {
  const ref = useRef<HTMLDivElement>(null);
  const [eta, setEta] = useState(12);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Scroll-linked cinematic zoom on the embed (CSS scale + subtle pan)
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1.0, 1.15, 1.35, 1.25]);
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-4%"]);

  useEffect(() => {
    const id = setInterval(() => {
      setEta((e) => (e <= 1 ? 12 : e - 1));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="find" ref={ref} data-hot className="relative h-[100vh] bg-background">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Embedded map iframe — no API key required */}
        <motion.div style={{ scale, x, y }} className="absolute inset-0">
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(RESTAURANT.address)}&z=16&output=embed`}
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Restaurant location"
          />
        </motion.div>
        {/* Scan-line overlay for cinematic feel */}
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.15)_3px)]" />

        {/* Cinematic overlay tints */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_85%)]" />

        {/* Animated rider dot tracing across the screen */}
        {/* <motion.div
          className="pointer-events-none absolute top-1/2 left-0 z-20 -translate-y-1/2 text-[180px] drop-shadow-[0_0_18px_rgba(255,107,53,0.95)]"
          animate={{ x: ["8vw", "78vw", "8vw"], y: ["-20px", "10px", "-20px"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          🛵
        </motion.div> */}

        <div className="absolute top-0 left-0 right-0 p-6 flex items-start justify-between z-30">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent">
              Delivery · Live
            </p>
            <h2 className="font-display text-5xl uppercase tracking-tight mt-2">
              The Ride.
              <br />
              On Its Way.
            </h2>
          </div>
          <div className="hidden sm:block text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              ETA
            </p>
            <p className="font-display text-4xl text-accent mt-1">
              {eta}
              <span className="text-lg text-muted-foreground">m</span>
            </p>
          </div>
        </div>
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end gap-4 z-30">
          <div className="bg-card/85 backdrop-blur-md border border-border p-5 max-w-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent">
              {RESTAURANT.name}
            </p>
            <p className="font-display text-2xl uppercase mt-2 leading-tight">
              {RESTAURANT.address}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-3">
              {RESTAURANT.hours}
            </p>
            <a
              href={`https://www.google.com/maps/place/${RESTAURANT.lat},${RESTAURANT.lng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.3em] text-accent underline"
            >
              Open in Google Maps →
            </a>
          </div>
          <div className="bg-card/85 backdrop-blur-md border border-border p-4 hidden md:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
              Rider
            </p>
            <p className="font-display text-lg uppercase mt-1">Dawit · 🛵</p>
            <div className="mt-2 h-1 w-40 bg-border overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                animate={{ width: ["10%", "90%", "10%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SLOW-MO CHEESE PULL — ramps video playbackRate with scroll
   ============================================================ */
function SlowMoCheesePull() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      const rate = 1 - Math.min(0.7, Math.abs(v - 0.5) * 1.4);
      if (videoRef.current) videoRef.current.playbackRate = Math.max(0.3, rate);
    });
    return () => unsub();
  }, [scrollYProgress]);

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.25, 1.1]);
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0]);

  return (
    <section ref={ref} data-hot className="relative h-[110vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div style={{ scale }} className="absolute inset-0">
          <video
            ref={videoRef}
            src={EATING_VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/40" />
        </motion.div>
        <motion.div
          style={{ opacity: textOpacity }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent mb-4">
            Slow-Mo · 0.3x
          </p>
          <h2 className="font-display text-6xl uppercase tracking-tight leading-[0.9]">
            The Cheese
            <br />
            <span className="text-accent">Pull.</span>
          </h2>
          <p className="mt-6 font-serif italic text-xl text-foreground/80 max-w-md">
            Three Injoyed patties. One frame at a time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   CART DOCK
   ============================================================ */
function CartDock({
  cart,
  total,
  count,
  onAdd,
  onRemove,
  onCheckout,
}: {
  cart: Record<string, number>;
  total: number;
  count: number;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}) {
  const [open, setOpen] = useState(false);
  if (count === 0) return null;
  const lines = Object.entries(cart)
    .map(([id, q]) => ({ item: MENU.find((m) => m.id === id)!, q }))
    .filter((l) => l.item);

  return (
    <>
      <motion.button
        id="cart"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={() => setOpen((o) => !o)}
        type="button"
        className="fixed bottom-4 left-4 right-4 z-40 bg-accent text-accent-foreground px-5 py-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.3em] shadow-[0_10px_40px_rgba(255,100,40,0.35)]"
      >
        <span>
          {count} item{count > 1 ? "s" : ""}
        </span>
        <span>
          {open ? "Close" : "View order"} · {birr(total)}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-[68px] left-4 right-4 z-40 bg-card border border-border p-5 max-h-[60vh] overflow-y-auto"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent mb-4">
              Your Order
            </p>
            <ul className="space-y-3">
              {lines.map(({ item, q }) => (
                <li key={item.id} className="flex items-center gap-3">
                  <img src={item.img} alt="" className="w-12 h-12 object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-lg uppercase leading-none truncate">
                      {item.name}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                      {birr(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="w-7 h-7 border border-border"
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{q}</span>
                    <button
                      type="button"
                      onClick={() => onAdd(item.id)}
                      className="w-7 h-7 border border-border"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-4 border-t border-border flex justify-between font-mono text-xs uppercase tracking-widest">
              <span>Total</span>
              <span className="text-accent">{birr(total)}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onCheckout();
              }}
              className="mt-4 w-full py-4 bg-foreground text-background font-display text-xl uppercase tracking-wider"
            >
              Checkout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ============================================================
   CHECKOUT SCENE — cinematic overlay
   ============================================================ */
function CheckoutScene({
  mode,
  setMode,
  cart,
  total,
  lastResult,
  onClose,
  onPlaced,
}: {
  mode: "choose" | "order" | "book" | "done";
  setMode: (m: "choose" | "order" | "book" | "done") => void;
  cart: Record<string, number>;
  total: number;
  lastResult: { id: string; waLink: string; teLink: string } | null;
  onClose: () => void;
  onPlaced: (r: { id: string; waLink: string; teLink: string }) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto"
    >
      {/* spotlight */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,140,60,0.18),transparent_60%)]" />
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground"
      >
        ✕ Close
      </button>

      <div className="relative w-full max-w-lg">
        {mode === "choose" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center space-y-8"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent">
              Final Reel
            </p>
            <h2 className="font-display text-5xl uppercase leading-[0.9] tracking-tight">
              Ready For The
              <br />
              <span className="text-accent">First Bite?</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button
                type="button"
                onClick={() => setMode("order")}
                className="py-5 bg-accent text-accent-foreground font-display text-xl uppercase tracking-wider hover:scale-[1.02] transition-transform"
              >
                Order Now
              </button>
              <button
                type="button"
                onClick={() => setMode("book")}
                className="py-5 border border-accent text-accent font-display text-xl uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Book Table
              </button>
            </div>
          </motion.div>
        )}

        {mode === "order" && (
          <OrderForm
            cart={cart}
            total={total}
            onBack={() => setMode("choose")}
            onPlaced={onPlaced}
          />
        )}
        {mode === "book" && <BookingForm onBack={() => setMode("choose")} onPlaced={onPlaced} />}
        {mode === "done" && lastResult && <DoneScene result={lastResult} onClose={onClose} />}
      </div>
    </motion.div>
  );
}

function OrderForm({
  cart,
  total,
  onBack,
  onPlaced,
}: {
  cart: Record<string, number>;
  total: number;
  onBack: () => void;
  onPlaced: (r: { id: string; waLink: string; teLink: string }) => void;
}) {
  const placeOrderFn = useServerFn(placeOrder);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const items = Object.entries(cart).map(([id, qty]) => {
    const m = MENU.find((x) => x.id === id)!;
    return { id, name: m.name, qty, price: m.price };
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || items.length === 0) return;
    setBusy(true);
    setErr(null);
    try {
      const result = await placeOrderFn({
        data: { customer_name: name, phone, note: note || null, items, total_etb: total },
      });
      const lines = items.map((i) => `• ${i.qty}× ${i.name} (ETB ${i.price * i.qty})`).join("%0A");
      const text = `Hi Injoy BURGERS! New order from ${name} (${phone}):%0A${lines}%0ATotal: ETB ${total}${note ? "%0ANote: " + encodeURIComponent(note) : ""}%0AOrder ID: ${result.id.slice(0, 8)}`;
      const waLink = `https://wa.me/${RESTAURANT.whatsapp}?text=${text}`;
      const teLink = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Hi Injoy BURGERS! New order from ${name} (${phone}):\n${lines}\nTotal: ETB ${total}`)}`;
      awardLoyalty(total);
      onPlaced({ id: result.id, waLink, teLink });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-5"
    >
      <button
        type="button"
        onClick={onBack}
        className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground"
      >
        ← Back
      </button>
      <h2 className="font-display text-3xl uppercase tracking-tight">Order Details</h2>

      <div className="border border-border p-4 space-y-1 font-mono text-xs">
        {items.map((i) => (
          <div key={i.id} className="flex justify-between">
            <span>
              {i.qty}× {i.name}
            </span>
            <span className="text-accent">{birr(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2 mt-2 border-t border-border">
          <span>Total</span>
          <span className="text-accent">{birr(total)}</span>
        </div>
      </div>

      <Field label="Your Name" value={name} onChange={setName} required maxLength={80} />
      <Field
        label="Phone (Telegram / WhatsApp)"
        value={phone}
        onChange={setPhone}
        required
        placeholder="0912 345 678"
        type="tel"
      />
      <Field label="Note (optional)" value={note} onChange={setNote} maxLength={400} textarea />

      {err && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-destructive">{err}</p>
      )}

      <button
        type="submit"
        disabled={busy || items.length === 0}
        className="w-full py-5 bg-accent text-accent-foreground font-display text-xl uppercase tracking-wider disabled:opacity-50"
      >
        {busy ? "Sending…" : `Confirm Order · ${birr(total)}`}
      </button>
    </motion.form>
  );
}

function BookingForm({
  onBack,
  onPlaced,
}: {
  onBack: () => void;
  onPlaced: (r: { id: string; waLink: string; teLink: string }) => void;
}) {
  const bookTableFn = useServerFn(bookTable);
  const today = new Date().toISOString().slice(0, 10);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [party, setParty] = useState(2);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("19:00");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const reserved_for = new Date(`${date}T${time}:00`).toISOString();
      const result = await bookTableFn({
        data: {
          name,
          phone,
          party_size: party,
          reserved_for,
          note: note || null,
        },
      });
      const text = `Hi Injoy BURGERS! Reservation: ${name} (${phone}) — party of ${party} for ${date} ${time}${note ? "%0ANote: " + encodeURIComponent(note) : ""}%0AID: ${result.id.slice(0, 8)}`;
      const waLink = `https://wa.me/${RESTAURANT.whatsapp}?text=${text}`;
      const teText = `Hi Injoy BURGERS! Reservation: ${name} (${phone}) — party of ${party} for ${date} ${time}${note ? `\nNote: ${note}` : ""}\nID: ${result.id.slice(0, 8)}`;
      const teLink = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(teText)}`;
      onPlaced({ id: result.id, waLink, teLink });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not book table");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-5"
    >
      <button
        type="button"
        onClick={onBack}
        className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground"
      >
        ← Back
      </button>
      <h2 className="font-display text-3xl uppercase tracking-tight">Reserve A Table</h2>

      <Field label="Your Name" value={name} onChange={setName} required maxLength={80} />
      <Field
        label="Phone"
        value={phone}
        onChange={setPhone}
        required
        type="tel"
        placeholder="0912 345 678"
      />
      <div className="grid grid-cols-3 gap-3">
        <NumField label="Party" value={party} onChange={setParty} min={1} max={20} />
        <Field label="Date" value={date} onChange={setDate} type="date" required />
        <Field label="Time" value={time} onChange={setTime} type="time" required />
      </div>
      <Field label="Note (optional)" value={note} onChange={setNote} maxLength={400} textarea />

      {err && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-destructive">{err}</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full py-5 bg-accent text-accent-foreground font-display text-xl uppercase tracking-wider disabled:opacity-50"
      >
        {busy ? "Booking…" : "Confirm Reservation"}
      </button>
    </motion.form>
  );
}

function DoneScene({
  result,
  onClose,
}: {
  result: { id: string; waLink: string; teLink: string };
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mx-auto h-20 w-20 rounded-full bg-accent/20 grid place-items-center"
      >
        <span className="text-3xl">🔥</span>
      </motion.div>
      <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent">
        Sent To The Kitchen
      </p>
      <h2 className="font-display text-4xl uppercase tracking-tight leading-[0.9]">
        We've Got Fire
        <br />
        On Your Order.
      </h2>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        ID · {result.id.slice(0, 8).toUpperCase()}
      </p>

      <LiveOrderTracker orderId={result.id} />

      <div className="relative h-24 border border-border bg-card/60 overflow-hidden">
        <svg viewBox="0 0 400 96" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="route" x1="0" x2="1">
              <stop offset="0%" stopColor="#ff7a2b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ff7a2b" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M 20 70 Q 120 10, 200 50 T 380 30"
            fill="none"
            stroke="url(#route)"
            strokeWidth="2"
            strokeDasharray="4 6"
          />
          <circle cx="20" cy="70" r="5" fill="#ff7a2b" />
          <circle cx="380" cy="30" r="5" fill="#f5f5f5" />
        </svg>
        <motion.div
          animate={{
            x: [20, 200, 380],
            y: [70, 10, 30],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-0 text-2xl"
        >
          🛵
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={result.waLink}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-accent text-accent font-mono text-[10px] uppercase tracking-[0.4em] px-6 py-3 hover:bg-accent hover:text-accent-foreground transition"
        >
          Confirm on WhatsApp →
        </a>
        <a
          href={result.teLink}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-accent text-accent font-mono text-[10px] uppercase tracking-[0.4em] px-6 py-3 hover:bg-accent hover:text-accent-foreground transition"
        >
          Confirm on Telegram →
        </a>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Live order tracker — progresses through 5 stages with timestamps
   ============================================================ */
const TRACK_STAGES = [
  { key: "Injoyed", label: "Order Injoyed", at: 0, icon: "🔥" },
  { key: "wrapped", label: "Wrapped Hot", at: 8, icon: "📦" },
  { key: "out", label: "Out For Delivery", at: 20, icon: "🛵" },
  { key: "street", label: "On Your Street", at: 38, icon: "📍" },
  { key: "knock", label: "Knock Knock", at: 55, icon: "🚪" },
] as const;

function LiveOrderTracker({ orderId }: { orderId: string }) {
  const storageKey = `Injoy:track:${orderId}`;
  const [startedAt] = useState<number>(() => {
    if (typeof window === "undefined") return Date.now();
    const saved = window.localStorage.getItem(storageKey);
    if (saved) return Number(saved);
    const now = Date.now();
    window.localStorage.setItem(storageKey, String(now));
    return now;
  });
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const activeIdx = TRACK_STAGES.reduce((acc, s, i) => (elapsed >= s.at ? i : acc), 0);
  const totalSpan = TRACK_STAGES[TRACK_STAGES.length - 1].at;
  const progressPct = Math.min(100, (elapsed / totalSpan) * 100);

  const fmtClock = (ts: number) =>
    new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const nextStage = TRACK_STAGES[activeIdx + 1];
  const etaSec = nextStage ? Math.max(0, nextStage.at - elapsed) : 0;

  return (
    <div className="text-left border border-border bg-card/60 backdrop-blur-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent">
            Live Tracking
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {nextStage
            ? `Next · ${Math.floor(etaSec / 60)}:${String(etaSec % 60).padStart(2, "0")}`
            : "Delivered"}
        </p>
      </div>

      <div className="relative h-1 w-full bg-border overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ boxShadow: "0 0 12px rgba(255,122,43,0.7)" }}
        />
      </div>

      <ol className="space-y-3">
        {TRACK_STAGES.map((s, i) => {
          const reached = i <= activeIdx;
          const isActive = i === activeIdx;
          const stageTs = startedAt + s.at * 1000;
          return (
            <li key={s.key} className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs transition-all ${
                  reached
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-background text-muted-foreground/50"
                } ${isActive ? "shadow-[0_0_14px_rgba(255,122,43,0.7)]" : ""}`}
              >
                {reached ? s.icon : i + 1}
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <p
                  className={`font-mono text-[11px] uppercase tracking-[0.3em] transition-colors ${
                    isActive
                      ? "text-foreground"
                      : reached
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                  }`}
                >
                  {s.label}
                  {isActive && (
                    <motion.span
                      className="ml-2 inline-block h-1 w-1 rounded-full bg-accent align-middle"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}
                </p>
                <p
                  className={`font-mono text-[10px] tabular-nums tracking-wider ${
                    reached ? "text-accent" : "text-muted-foreground/40"
                  }`}
                >
                  {reached ? fmtClock(stageTs) : "—"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ============================================================
   Form bits
   ============================================================ */
function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  maxLength,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          rows={3}
          className="mt-2 w-full bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          className="mt-2 w-full bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
        />
      )}
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) =>
          onChange(Math.max(min, Math.min(max, parseInt(e.target.value || "0", 10))))
        }
        className="mt-2 w-full bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
      />
    </label>
  );
}

/* ============================================================
   RESERVE CTA + FOOTER
   ============================================================ */
function Reserve({ onReserve }: { onReserve: () => void }) {
  return (
    <section id="reserve" className="px-6 py-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
        className="border-t border-accent/40 pt-10 space-y-8"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent">
          Final Reel · Reserve
        </p>
        <h2 className="font-display text-[56px] uppercase leading-[0.9] tracking-tight">
          Take Your
          <br />
          <span className="italic font-serif lowercase text-foreground/50">seat at the</span>
          <br />
          Injoy
        </h2>
        <div className="grid grid-cols-2 gap-6 font-mono text-[10px] uppercase tracking-[0.3em]">
          <div>
            <p className="text-muted-foreground">Location</p>
            <p className="mt-2">{RESTAURANT.address}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Hours</p>
            <p className="mt-2">{RESTAURANT.hours}</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onReserve}
          className="w-full py-6 bg-accent text-accent-foreground font-display text-2xl uppercase tracking-wider"
        >
          Reserve A Table
        </motion.button>
      </motion.div>
    </section>
  );
}

function FooterStrip() {
  return (
    <footer className="px-6 pb-28 flex justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
      <span>© MMXXVI Injoy BURGERS · Bole, Addis</span>
      <span>Crafted In Fire</span>
    </footer>
  );
}

/* ============================================================
   RIDER CAM — Big cinematic rider hero with live HUD overlay
   ============================================================ */
function RiderCam() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.35, 1.25, 1.4]);
  const streakX = useTransform(scrollYProgress, [0, 1], ["-30%", "30%"]);

  // Live HUD values
  const [speed, setSpeed] = useState(38);
  const [distance, setDistance] = useState(1.2);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setSpeed((s) => Math.max(22, Math.min(58, s + (Math.random() - 0.5) * 6)));
      setDistance((d) => Math.max(0.1, +(d - 0.03).toFixed(2)));
      setProgress((p) => (p >= 100 ? 0 : p + 1.2));
    }, 220);
    return () => clearInterval(id);
  }, []);

  const stages = [
    { label: "Order Injoyed", t: 15 },
    { label: "Wrapped Hot", t: 35 },
    { label: "Out For Delivery", t: 55 },
    { label: "On Your Street", t: 80 },
    { label: "Knock Knock", t: 100 },
  ];
  const currentStage = stages.findIndex((s) => progress < s.t);
  const activeIdx = currentStage === -1 ? stages.length - 1 : currentStage;

  return (
    <section ref={ref} data-hot className="relative h-[100vh] bg-background overflow-hidden">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Moving road backdrop — gives a sense of motion behind the rider */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,122,43,0.0) 0 80px, rgba(255,122,43,0.55) 80px 120px), radial-gradient(ellipse at center, #1a0a05 0%, #000 70%)",
            backgroundSize: "200px 100%, 100% 100%",
          }}
          animate={{ backgroundPositionX: ["0px, 0px", "-2000px, 0px"] }}
          transition={{ duration: 2.2, ease: "linear", repeat: Infinity }}
        />

        {/* Live rider video — actually riding, with subtle handheld bob */}
        <motion.div
          className="absolute inset-0"
          animate={{
            x: [0, -4, 3, -2, 0],
            y: [0, -5, 2, -3, 0],
            rotate: [0, -0.3, 0.25, -0.15, 0],
          }}
          transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.video
            src={RIDER_VIDEO_SRC}
            poster={riderImg}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{ y, scale }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>

        {/* Speed streaks racing past camera */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[12, 28, 44, 60, 72, 86].map((top, i) => (
            <motion.div
              key={i}
              className="absolute h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent blur-[1px]"
              style={{ top: `${top}%`, width: `${30 + (i % 3) * 20}%` }}
              animate={{ x: ["110%", "-120%"] }}
              transition={{
                duration: 0.6 + (i % 3) * 0.25,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.12,
              }}
            />
          ))}
          {[20, 50, 78].map((top, i) => (
            <motion.div
              key={`g-${i}`}
              className="absolute h-24 w-1/2 bg-gradient-to-r from-transparent via-accent/25 to-transparent blur-2xl mix-blend-screen"
              style={{ top: `${top}%` }}
              animate={{ x: ["120%", "-120%"] }}
              transition={{ duration: 1.4 + i * 0.4, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </div>

        {/* Light streak that drifts on scroll */}
        <motion.div
          style={{ x: streakX }}
          className="pointer-events-none absolute top-1/2 -left-1/4 w-[150%] h-40 -translate-y-1/2 mix-blend-screen"
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-accent/40 to-transparent blur-3xl" />
        </motion.div>
        {/* Vignette + grade */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/10 to-transparent" />

        {/* Top label */}
        <div className="absolute top-0 left-0 right-0 p-6 md:p-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent">
                Rider Cam · Live
              </p>
            </div>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mt-3 leading-[0.85]">
              Meet
              <br />
              Your Rider.
            </h2>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              Order #SB-{String(Math.floor(progress * 9 + 1042)).padStart(4, "0")}
            </p>
            <p className="font-display text-2xl mt-1">Bole · Addis</p>
          </div>
        </div>

        {/* Big speed dial — bottom-left */}
        <div className="absolute left-6 md:left-10 bottom-32 md:bottom-24 flex items-end gap-6">
          <div className="relative w-40 h-40 md:w-52 md:h-52">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="3"
                fill="none"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                stroke="hsl(var(--accent, 18 96% 58%))"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="276"
                animate={{ strokeDashoffset: 276 - (speed / 80) * 276 }}
                transition={{ duration: 0.4 }}
                style={{ filter: "drop-shadow(0 0 12px rgba(255,122,43,0.7))" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-5xl md:text-6xl leading-none text-accent">
                {Math.round(speed)}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground mt-1">
                km/h
              </p>
            </div>
          </div>
          <div className="pb-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              Distance
            </p>
            <p className="font-display text-3xl md:text-4xl text-foreground mt-1">
              {distance.toFixed(2)}
              <span className="text-base text-muted-foreground ml-1">km</span>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground mt-4">
              Plate
            </p>
            <p className="font-display text-xl mt-1">AA · 12345</p>
          </div>
        </div>

        {/* Rider card — right side */}
        <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 hidden lg:block">
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-card/85 backdrop-blur-xl border border-border p-6 w-72"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center font-display text-xl text-accent-foreground">
                D
              </div>
              <div>
                <p className="font-display text-xl uppercase leading-none">Dawit T.</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground mt-1">
                  ★ 4.97 · 1,284 rides
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {stages.map((s, i) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full transition-all ${
                      i <= activeIdx
                        ? "bg-accent shadow-[0_0_10px_rgba(255,122,43,0.9)]"
                        : "bg-border"
                    }`}
                  />
                  <p
                    className={`font-mono text-[10px] uppercase tracking-[0.3em] transition-colors ${
                      i === activeIdx
                        ? "text-foreground"
                        : i < activeIdx
                          ? "text-muted-foreground line-through"
                          : "text-muted-foreground/50"
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 h-1 w-full bg-border overflow-hidden">
              <motion.div
                className="h-full bg-accent"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <a
              href={`tel:${RESTAURANT.whatsapp}`}
              className="mt-5 block text-center py-3 border border-accent text-accent font-mono text-[10px] uppercase tracking-[0.4em] hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Call Rider
            </a>
          </motion.div>
        </div>

        {/* Bottom ticker */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background/70 backdrop-blur-md overflow-hidden">
          <motion.div
            className="flex gap-12 py-3 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          >
            {Array.from({ length: 2 }).flatMap((_, j) =>
              [
                "🛵 Rider Departed Kitchen",
                "🔥 Patty Injoyed @ 232°C",
                "🧀 Cheese Melted To Spec",
                "📦 Heat-Sealed Box · 64°C",
                "📍 ETA Locked · 9 min",
                "⭐ ★ 4.97 Rider Rating",
                "🎬 Live Feed · Bole 2Q2M+4H",
              ].map((t, i) => <span key={`${j}-${i}`}>{t}</span>),
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   STATS COUNTER — count-up cinematic stats strip
   ============================================================ */
function StatsCounter() {
  const stats = [
    { label: "Patties Injoyed", value: 184320, suffix: "+" },
    { label: "Avg Delivery", value: 14, suffix: " min" },
    { label: "Repeat Eaters", value: 92, suffix: "%" },
    { label: "Rider Rating", value: 4.97, suffix: "★", decimals: 2 },
  ];
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-10 bg-background border-y border-border overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="max-w-6xl mx-auto"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent">
          The Numbers Don't Lie
        </p>
        <h3 className="mt-3 font-display text-4xl md:text-6xl uppercase tracking-tight leading-[0.9] max-w-3xl">
          Injoyed. Wrapped. <span className="text-accent">Delivered.</span>
        </h3>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
          {stats.map((s) => (
            <CountStat key={s.label} {...s} />
          ))}
        </div>
      </motion.div>
      {/* drifting glow */}
      <motion.div
        className="pointer-events-none absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full bg-accent/10 blur-3xl"
        animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </section>
  );
}

function CountStat({
  label,
  value,
  suffix = "",
  decimals = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const start = performance.now();
          const dur = 1800;
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            setShown(value * eased);
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return (
    <div ref={ref}>
      <p className="font-display text-5xl md:text-7xl text-foreground leading-none tabular-nums">
        {shown.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        <span className="text-accent">{suffix}</span>
      </p>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
