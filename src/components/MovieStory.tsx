import { RESTAURANT } from "@/lib/menu";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef, useEffect } from "react";

import { useIsMobile } from "@/hooks/use-mobile";

import scene01 from "@/assets/scene-01-opening.mp4";
import scene02 from "@/assets/scene-02-story.mp4";
import scene03 from "@/assets/scene-03-chef.mp4";
import scene04 from "@/assets/scene-04-signature.mp4";
import scene05 from "@/assets/scene-05-reviews.mp4";
import scene06 from "@/assets/scene-06-final.mp4";

const SCENE_VIDEOS = [scene01, scene02, scene03, scene04, scene05, scene06];
const SCENE_OPTIMIZED = [
  "/media/hero-cinematic.mp4",
  "/media/pizza-making.mp4",
  "/media/eating-burger.mp4",
  "/media/rider-ride.mp4",
  "/media/hero-cinematic.mp4",
  "/media/rider-ride.mp4",
];

const SCENE_POSTERS = [
  "/media/hero-cinematic.jpg",
  "/media/pizza-making.jpg",
  "/media/eating-burger.jpg",
  "/media/rider-ride.jpg",
  "/media/hero-cinematic.jpg",
  "/media/rider-ride.jpg",
];

function preloadVideos() {
  if (typeof window === "undefined") return;
  SCENE_VIDEOS.forEach((src) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "video";
    link.href = src;
    document.head.appendChild(link);
  });
}

/* ============================================================
   MOVIE-THEMED SCROLL STORYTELLING
   6 cinematic scenes that progress like a film.
   ============================================================ */

const SCENES = [
  { n: "01", chapter: "Opening Scene", title: "A City Wakes Up Hungry." },
  { n: "02", chapter: "The Story", title: "Born In A Back-Alley Kitchen." },
  { n: "03", chapter: "Meet The Chef", title: "The Hands Behind The Injoy." },
  { n: "04", chapter: "Signature", title: "Four Dishes. One Legend." },
  { n: "05", chapter: "Reviews", title: "What The City Is Saying." },
  { n: "06", chapter: "Final Cut", title: "Your Table. Your Move." },
];

export function MovieStory({
  onOrder,
  onBook,
  dbVideos,
}: {
  onOrder: () => void;
  onBook: () => void;
  dbVideos: any[] | undefined;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  useEffect(() => {
    preloadVideos();
  }, []);

  return (
    <section ref={wrapRef} className="relative" style={{ height: `${SCENES.length * 110}vh` }}>
      {/* Sticky film viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black sticky-viewport">
        {/* Letterbox bars */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-[8vh] bg-black hidden md:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[8vh] bg-black hidden md:block" />

        {/* Film grain */}
        <div
          className="pointer-events-none absolute inset-0 z-30 opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>\")",
          }}
        />

        {/* Vignette */}
        <div className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.85)_100%)]" />

        {/* Chapter dial top-left */}
        <ChapterDial progress={progress} />

        {/* Timecode top-right */}
        <Timecode progress={progress} />

        {/* Reel ticker bottom */}
        <ReelTicker />

        {/* Scenes */}
        {SCENES.map((s, i) => (
          <Scene
            key={s.n}
            index={i}
            total={SCENES.length}
            progress={progress}
            data={s}
            onOrder={onOrder}
            onBook={onBook}
            dbVideos={dbVideos}
          />
        ))}

        {/* Progress film strip */}
        <FilmStrip progress={progress} />
      </div>
    </section>
  );
}

/* ---------------- Scene shell ---------------- */
function Scene({
  index,
  total,
  progress,
  data,
  onOrder,
  onBook,
  dbVideos,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
  data: { n: string; chapter: string; title: string };
  onOrder: () => void;
  onBook: () => void;
  dbVideos: any[] | undefined;
}) {
  const seg = 1 / total;
  const start = index * seg;
  const end = (index + 1) * seg;
  const mid = start + seg * 0.5;

  // each scene: fade-in, hold, fade-out
  const opacity = useTransform(
    progress,
    [start, start + seg * 0.15, end - seg * 0.15, end],
    [0, 1, 1, 0],
  );
  const scale = useTransform(progress, [start, mid, end], [1.15, 1.0, 0.92]);
  const y = useTransform(progress, [start, end], ["6%", "-6%"]);

  return (
    <motion.div
      style={{ opacity, scale, y }}
      className="absolute inset-0 z-10 flex items-center justify-center"
    >
      <SceneVisual index={index} progress={progress} start={start} end={end} dbVideos={dbVideos} />
      <SceneOverlay data={data} index={index} onOrder={onOrder} onBook={onBook} />
    </motion.div>
  );
}

/* ---------------- Per-scene visual ---------------- */
function SceneVisual({
  index,
  progress,
  start,
  end,
  dbVideos,
}: {
  index: number;
  progress: MotionValue<number>;
  start: number;
  end: number;
  dbVideos: any[] | undefined;
}) {
  const isMobile = useIsMobile();
  // slow Ken-Burns
  const k = useTransform(progress, [start, end], [1.05, 1.25]);
  const px = useTransform(progress, [start, end], ["-2%", "2%"]);

  const getSceneVideo = (idx: number) => {
    if (dbVideos && dbVideos.length > 0) {
      const sceneVideos = dbVideos.filter(
        (v: any) => v.section === "movie-story" && v.active !== false,
      );
      if (sceneVideos[idx]) return sceneVideos[idx].src;
    }
    return SCENE_VIDEOS[idx];
  };

  const getScenePoster = (idx: number) => {
    if (dbVideos && dbVideos.length > 0) {
      const sceneVideos = dbVideos.filter(
        (v: any) => v.section === "movie-story" && v.active !== false,
      );
      if (sceneVideos[idx]) return sceneVideos[idx].poster ?? SCENE_POSTERS[idx];
    }
    return SCENE_POSTERS[idx];
  };

  const gradients = [
    "bg-gradient-to-t from-black via-black/40 to-black/60",
    "bg-gradient-to-r from-black via-black/40 to-transparent",
    "bg-gradient-to-l from-black via-black/30 to-black/70",
    "bg-gradient-to-t from-black via-black/30 to-black/80",
    "bg-gradient-to-br from-black/70 via-black/40 to-black/80",
    "bg-gradient-to-t from-black via-black/40 to-black/40",
  ];

  return (
    <motion.div style={{ scale: k, x: px }} className="absolute inset-0">
      <video
        src={getSceneVideo(index)}
        autoPlay
        muted
        loop
        playsInline
        preload={isMobile ? "metadata" : "auto"}
        poster={getScenePoster(index)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className={`absolute inset-0 ${gradients[index]}`} />
    </motion.div>
  );
}

/* ---------------- Overlay text per scene ---------------- */
function SceneOverlay({
  data,
  index,
  onOrder,
  onBook,
}: {
  data: { n: string; chapter: string; title: string };
  index: number;
  onOrder: () => void;
  onBook: () => void;
}) {
  return (
    <div className="relative z-20 mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-6 pb-[14vh] md:px-12">
      {/* Slate header */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="mb-6 flex items-center gap-4"
      >
        <span className="font-mono text-xs tracking-[0.3em] text-orange-400">SCENE {data.n}</span>
        <span className="h-px flex-1 max-w-[160px] bg-orange-400/40" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
          {data.chapter}
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 40, letterSpacing: "0.2em" }}
        whileInView={{ opacity: 1, y: 0, letterSpacing: "-0.02em" }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] max-w-4xl"
      >
        {data.title}
      </motion.h2>

      {/* Per-scene body content */}
      <div className="mt-8 max-w-2xl text-white/80">
        <SceneBody index={index} onOrder={onOrder} onBook={onBook} />
      </div>
    </div>
  );
}

function SceneBody({
  index,
  onOrder,
  onBook,
}: {
  index: number;
  onOrder: () => void;
  onBook: () => void;
}) {
  const fade = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.4 },
    transition: { duration: 0.7, delay: 0.2 },
  };

  if (index === 0)
    return (
      <motion.p {...fade} className="text-lg md:text-xl leading-relaxed">
        It's 7 PM in Bole. Traffic hums, neon flickers, and somewhere a flat-top sizzles. This is
        where the story begins.
      </motion.p>
    );
  if (index === 1)
    return (
      <motion.div {...fade} className="space-y-3 text-base md:text-lg">
        <p>
          2019 — a small kitchen, two cooks, one obsession: a patty so thin and crisp it changed the
          rules.
        </p>
        <p className="text-orange-300/90 font-mono text-sm">
          → Six years later, the recipe hasn't moved an inch.
        </p>
      </motion.div>
    );
  if (index === 2)
    return (
      <motion.div {...fade} className="flex items-center gap-5">
        <div className="h-16 w-16 rounded-full border border-orange-400/60 bg-orange-400/10 flex items-center justify-center text-2xl">
          👨‍🍳
        </div>
        <div>
          <div className="font-display text-2xl text-white">Chef Dawit Bekele</div>
          <div className="text-sm text-white/60">15 years of fire. One signature Injoy.</div>
        </div>
      </motion.div>
    );
  if (index === 3)
    return (
      <motion.div {...fade} className="grid grid-cols-2 gap-3 max-w-md">
        {["Malmo Injoy", "Triple", "BBQ Chili", "Smoked Sausage"].map((d) => (
          <div
            key={d}
            className="border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm"
          >
            <span className="text-orange-400 font-mono text-xs">★ </span>
            {d}
          </div>
        ))}
      </motion.div>
    );
  if (index === 4)
    return (
      <motion.div {...fade} className="space-y-4">
        <blockquote className="text-xl md:text-2xl font-display italic leading-snug">
          "Best Injoy burger in Addis. The crust. The drip. The everything."
        </blockquote>
        <div className="flex items-center gap-3 text-sm text-white/60">
          <span className="text-orange-400">★★★★★</span>
          <span>· Hanna T. · Google Review</span>
        </div>
      </motion.div>
    );
  // 5 — Final CTA
  return (
    <motion.div {...fade} className="space-y-5">
      <p className="text-lg text-white/85">Roll credits — or roll up to the counter.</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onOrder}
          className="bg-orange-500 hover:bg-orange-400 text-black font-bold uppercase tracking-widest text-sm px-7 py-4 transition-colors"
        >
          Order Now
        </button>
        <button
          onClick={onBook}
          className="border border-white/30 hover:border-white text-white uppercase tracking-widest text-sm px-7 py-4 transition-colors"
        >
          Reserve a Table
        </button>
        <a
          href={`tel:+${RESTAURANT.whatsapp}`}
          className="underline underline-offset-4 text-white/70 hover:text-white text-sm self-center"
        >
          or call +{RESTAURANT.whatsapp}
        </a>
      </div>
    </motion.div>
  );
}

/* ---------------- Chapter dial ---------------- */
function ChapterDial({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="absolute left-6 md:left-10 top-[10vh] z-40 flex flex-col gap-2">
      {SCENES.map((s, i) => {
        const seg = 1 / SCENES.length;
        const active = useTransform(progress, (v) => v >= i * seg && v < (i + 1) * seg);
        const op = useTransform(active, (a) => (a ? 1 : 0.35));
        return (
          <motion.div key={s.n} style={{ opacity: op }} className="flex items-center gap-2">
            <motion.div
              className="h-px bg-orange-400"
              style={{ width: useTransform(active, (a) => (a ? 36 : 14)) }}
            />
            <span className="font-mono text-[10px] tracking-[0.25em] text-white/70">
              {s.n} · {s.chapter.toUpperCase()}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------- Timecode ---------------- */
function Timecode({ progress }: { progress: MotionValue<number> }) {
  const tc = useTransform(progress, (v) => {
    const total = 6 * 60; // 6:00 reel
    const s = Math.floor(v * total);
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    const ff = String(Math.floor((v * total * 24) % 24)).padStart(2, "0");
    return `00:${mm}:${ss}:${ff}`;
  });
  return (
    <div className="absolute right-6 md:right-10 top-[10vh] z-40 flex items-center gap-3">
      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
      <span className="font-mono text-[11px] tracking-[0.2em] text-white/80">REC</span>
      <motion.span className="font-mono text-[11px] tracking-[0.15em] text-orange-300">
        {tc}
      </motion.span>
    </div>
  );
}

/* ---------------- Film strip progress ---------------- */
function FilmStrip({ progress }: { progress: MotionValue<number> }) {
  const width = useTransform(progress, [0, 1], ["0%", "100%"]);
  return (
    <div className="absolute inset-x-0 bottom-[8vh] z-40 h-1 bg-white/10">
      <motion.div
        style={{ width }}
        className="h-full bg-gradient-to-r from-orange-500 via-orange-300 to-orange-500"
      />
    </div>
  );
}

/* ---------------- Reel ticker ---------------- */
function ReelTicker() {
  return (
    <div className="absolute inset-x-0 bottom-[2vh] z-40 flex items-center gap-6 overflow-hidden px-6 font-mono text-[10px] tracking-[0.3em] text-white/40">
      <motion.div
        className="flex shrink-0 gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i}>
            ◉ Injoy BURGERS · A FILM BY THE KITCHEN · BOLE, ADDIS ABABA ·{" "}
            {String(i + 1).padStart(2, "0")} · 24 FPS · 35MM · DOLBY ATMOS ·
          </span>
        ))}
      </motion.div>
    </div>
  );
}
