"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ScrollRuler.module.css";

const STEP = 25; // px between ticks
const MAJOR = 5; // a numbered tick every MAJOR ticks
const PERIOD = STEP * MAJOR;

const tickCountFor = (height: number) => (Math.ceil(height / PERIOD) + 2) * MAJOR;
const pct = (p: number) => `${String(Math.round(p * 100)).padStart(3, "0")}%`;

/**
 * Decorative right-edge ruler. The tick tape scrolls with the page and a thin accent marker tracks
 * scroll progress. Hidden below 1320px; static under prefers-reduced-motion.
 */
export default function ScrollRuler() {
  const [count, setCount] = useState(() => tickCountFor(1200));
  const [base, setBase] = useState(0); // tick index at the top of the tape
  const [motion, setMotion] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tapeRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1320px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotion(wide.matches && !reduce.matches);
    sync();
    wide.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!motion) {
      setBase(0);
      if (tapeRef.current) tapeRef.current.style.transform = "";
      return;
    }

    let frame = 0;
    let lastBase = -1;

    const update = () => {
      frame = 0;
      const root = rootRef.current;
      if (!root) return;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

      const nextBase = Math.floor(y / PERIOD) * MAJOR;
      if (nextBase !== lastBase) {
        lastBase = nextBase;
        setBase(nextBase);
      }
      if (tapeRef.current) tapeRef.current.style.transform = `translate3d(0, ${-(y % PERIOD)}px, 0)`;

      const h = root.clientHeight;
      if (markerRef.current) markerRef.current.style.transform = `translate3d(0, ${Math.round(progress * (h - 1))}px, 0)`;
      if (readoutRef.current) readoutRef.current.textContent = pct(progress);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      setCount(tickCountFor(window.innerHeight));
      schedule();
    };

    onResize();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [motion]);

  const ticks = Array.from({ length: count }, (_, i) => base + i);

  return (
    <div ref={rootRef} className={styles.ruler} aria-hidden="true">
      <div ref={tapeRef} className={styles.tape}>
        {ticks.map((n, i) => {
          const major = n % MAJOR === 0;
          return (
            <div key={i} className={major ? `${styles.tick} ${styles.major}` : styles.tick} style={{ top: i * STEP }}>
              {major ? <span className={styles.label}>{n}</span> : null}
            </div>
          );
        })}
      </div>
      {motion ? (
        <div ref={markerRef} className={styles.marker}>
          <span ref={readoutRef} className={styles.readout}>
            {pct(0)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
