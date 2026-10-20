import type { CSSProperties, ReactNode } from "react";
import { REPO_URL } from "@/lib/site";
import styles from "./Hero.module.css";

type Drifter = {
  kind: "clip" | "frame";
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  dur: number;
  delay: number;
};

// Outlined timeline clips and film frames scattered around the rings. Positions are in the 1600x1000 viewBox.
const DRIFTERS: Drifter[] = [
  { kind: "frame", x: 300, y: 60, w: 150, h: 96, dx: 18, dy: 10, dur: 26, delay: 0 },
  { kind: "clip", x: 560, y: 150, w: 190, h: 40, dx: -24, dy: 6, dur: 30, delay: -6 },
  { kind: "frame", x: 1080, y: 70, w: 170, h: 108, dx: -14, dy: 16, dur: 28, delay: -12 },
  { kind: "clip", x: 1260, y: 260, w: 220, h: 44, dx: 20, dy: -8, dur: 34, delay: -3 },
  { kind: "clip", x: 110, y: 300, w: 200, h: 40, dx: 26, dy: 8, dur: 32, delay: -18 },
  { kind: "frame", x: 40, y: 470, w: 140, h: 90, dx: 12, dy: -14, dur: 24, delay: -9 },
  { kind: "clip", x: 330, y: 610, w: 160, h: 38, dx: -18, dy: -10, dur: 29, delay: -14 },
  { kind: "frame", x: 1290, y: 520, w: 160, h: 102, dx: -16, dy: -12, dur: 27, delay: -21 },
  { kind: "clip", x: 1050, y: 720, w: 210, h: 42, dx: 22, dy: 6, dur: 31, delay: -7 },
  { kind: "frame", x: 160, y: 790, w: 170, h: 108, dx: 16, dy: -8, dur: 33, delay: -25 },
  { kind: "clip", x: 690, y: 880, w: 180, h: 40, dx: -20, dy: -6, dur: 28, delay: -11 },
  { kind: "frame", x: 1420, y: 820, w: 130, h: 84, dx: -10, dy: -14, dur: 25, delay: -4 },
];

type Arc = { r: number; tone: "accent" | "video" | "audio" | "wave"; len: number; dur: number; reverse: boolean };

const ARCS: Arc[] = [
  { r: 270, tone: "wave", len: 260, dur: 90, reverse: false },
  { r: 390, tone: "accent", len: 520, dur: 120, reverse: true },
  { r: 530, tone: "video", len: 760, dur: 150, reverse: false },
  { r: 690, tone: "audio", len: 680, dur: 180, reverse: true },
];

const TONE: Record<Arc["tone"], string> = {
  accent: styles.toneAccent,
  video: styles.toneVideo,
  audio: styles.toneAudio,
  wave: styles.toneWave,
};

function Sprockets({ w, h }: { w: number; h: number }) {
  const count = Math.max(4, Math.floor((w - 12) / 16));
  const step = (w - 12) / count;
  const holes = Array.from({ length: count }, (_, i) => 6 + i * step + (step - 7) / 2);
  return (
    <>
      {holes.map((x) => (
        <rect key={`t${x}`} x={x} y={4} width={7} height={5} rx={1} />
      ))}
      {holes.map((x) => (
        <rect key={`b${x}`} x={x} y={h - 9} width={7} height={5} rx={1} />
      ))}
      <rect x={6} y={14} width={w - 12} height={h - 28} rx={2} />
    </>
  );
}

function Scene() {
  return (
    <svg className={styles.scene} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <g className={styles.rings}>
        {[160, 270, 390, 530, 690, 860].map((r) => (
          <circle key={r} cx={800} cy={520} r={r} />
        ))}
      </g>
      <circle className={`${styles.ticks} ${styles.spin}`} cx={800} cy={520} r={460} style={{ animationDuration: "240s" }} />
      {ARCS.map((a) => {
        const c = 2 * Math.PI * a.r;
        return (
          <circle
            key={a.r}
            className={`${styles.arc} ${TONE[a.tone]} ${styles.spin}`}
            cx={800}
            cy={520}
            r={a.r}
            strokeDasharray={`${a.len} ${c - a.len}`}
            style={{ animationDuration: `${a.dur}s`, animationDirection: a.reverse ? "reverse" : "normal" }}
          />
        );
      })}
      <g className={styles.drifters}>
        {DRIFTERS.map((d) => {
          const style = { "--dx": `${d.dx}px`, "--dy": `${d.dy}px`, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` } as CSSProperties;
          return (
            <g key={`${d.x}-${d.y}`} transform={`translate(${d.x} ${d.y})`}>
              <g className={styles.drift} style={style}>
                {d.kind === "frame" ? (
                  <>
                    <rect width={d.w} height={d.h} rx={4} />
                    <Sprockets w={d.w} h={d.h} />
                  </>
                ) : (
                  <>
                    <rect width={d.w} height={d.h} rx={4} />
                    <line x1={10} y1={d.h / 2} x2={d.w * 0.32} y2={d.h / 2} />
                    <line x1={d.w - 12} y1={6} x2={d.w - 12} y2={d.h - 6} />
                  </>
                )}
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export default function Hero({ children }: { children?: ReactNode }) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Scene />
      <div className={styles.fade} aria-hidden="true" />
      <div className={styles.content}>
        <h1 id="hero-title" className={styles.wordmark}>oneTake</h1>
        <p className={`h1 ${styles.tagline}`}>
          Cut, grade, export. <em>Natively.</em>
        </p>
        <p className={`lede ${styles.lede}`}>
          A video editor for macOS, Windows and Linux. Free, with no account and no subscription.
        </p>
        <div className={styles.actions}>
          {children}
          <a className="btn btn-line" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            View source
          </a>
        </div>
        <p className={`mono dim ${styles.meta}`}>
          <span>macOS · Windows · Linux</span>
          <span aria-hidden="true">·</span>
          <span>Free</span>
          <span aria-hidden="true">·</span>
          <span>Open source</span>
        </p>
      </div>
    </section>
  );
}

export { Hero };
