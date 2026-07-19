import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { assetUrl } from "@/lib/asset-url";

type LensImage = {
  id: string;
  label: string;
  section: string;
  src: string;
  alt: string;
  sort_order: number;
  active: boolean;
};

const ORBIT_RADIUS = 280;
const MOBILE_ORBIT_RADIUS = 180;
const ANIMATION_DURATION = 40;

export function GoogleReel({ dbImages }: { dbImages: LensImage[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const goToNext = () => {
    if (active !== null) {
      setActive((prev) => (prev! + 1) % dbImages.length);
    }
  };

  const goToPrev = () => {
    if (active !== null) {
      setActive((prev) => (prev! - 1 + dbImages.length) % dbImages.length);
    }
  };

  const orbitRadius = isMobile ? MOBILE_ORBIT_RADIUS : ORBIT_RADIUS;

  if (dbImages.length === 0) return null;

  return (
    <section className="relative bg-black text-white py-20 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-6 mb-12">
        <div className="text-xs tracking-[0.5em] text-orange-400/80 uppercase mb-3">
          ⭐ Straight From Google · Verified
        </div>
        <h2 className="font-display text-4xl md:text-6xl uppercase leading-[0.9]">
          Through Their
          <br />
          <span className="text-orange-500">Lens.</span>
        </h2>
      </div>

      <div className="relative mx-auto w-[320px] h-[320px] md:w-[640px] md:h-[640px] google-reel-orbit">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full overflow-hidden z-10 border-2 border-orange-500/30">
          <img
            src="/media/google/logoimage.png"
            alt="Injoy logo"
            className="w-full h-full object-cover"
          />
        </div>

        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: ANIMATION_DURATION, ease: "linear", repeat: Infinity }}
        >
          {dbImages.map((p, i) => {
            const angle = (i * 360) / dbImages.length;
            return (
              <motion.div
                key={p.id}
                className="absolute w-20 h-20 md:w-44 md:h-44 rounded-2xl overflow-hidden ring-2 ring-white/30 shadow-2xl cursor-pointer orbit-photo"
                style={{
                  left: `calc(50% + ${orbitRadius * Math.cos((angle - 90) * Math.PI / 180)}px)`,
                  top: `calc(50% + ${orbitRadius * Math.sin((angle - 90) * Math.PI / 180)}px)`,
                  marginLeft: -40,
                  marginTop: -40,
                }}
                animate={{
                  rotate: -360,
                }}
                transition={{ duration: ANIMATION_DURATION, ease: "linear", repeat: Infinity }}
                onClick={() => setActive(i)}
              >
                <img
                  src={assetUrl(p.src)}
                  alt={p.alt || `Shot by ${p.label}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {active !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6"
        >
          <button
            onClick={goToPrev}
            className="absolute left-4 z-20 p-3 text-white/60 hover:text-white"
          >
            ←
          </button>

          <motion.img
            key={active}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={assetUrl(dbImages[active].src)}
            alt={dbImages[active].alt || ""}
            className="max-h-[88vh] max-w-[80vw] rounded-xl ring-1 ring-orange-500/30"
          />

          <button
            onClick={goToNext}
            className="absolute right-4 z-20 p-3 text-white/60 hover:text-white"
          >
            →
          </button>

          <div className="absolute bottom-6 text-center text-xs tracking-widest text-white/60 uppercase">
            📸 {dbImages[active].alt || dbImages[active].label} · {String(active + 1).padStart(2, "0")} / {String(dbImages.length).padStart(2, "0")}
          </div>

          <button
            onClick={() => setActive(null)}
            className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl"
          >
            ×
          </button>
        </motion.div>
      )}
    </section>
  );
}
