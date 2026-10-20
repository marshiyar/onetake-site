import Frame from "./Frame";
import s from "./illustrations.module.css";

const WHEELS = [
  { cx: 46, puck: [-6, 8] },
  { cx: 108, puck: [5, -4] },
  { cx: 170, puck: [-3, -9] },
] as const;

const GRID = [0, 1, 2, 3, 4];

export default function ColourArt() {
  return (
    <Frame>
      {WHEELS.map(({ cx, puck }, i) => (
        <g key={cx}>
          <circle className={s.ink3} cx={cx} cy={74} r={26} />
          <circle className={s.line} cx={cx} cy={74} r={14} />
          <line className={s.line} x1={cx - 26} y1={74} x2={cx + 26} y2={74} />
          <line className={s.line} x1={cx} y1={48} x2={cx} y2={100} />
          <circle className={i === 1 ? s.accent : s.ink} cx={cx + puck[0]} cy={74 + puck[1]} r={3} />
          {/* the wheel's master slider */}
          <line className={s.line} x1={cx - 24} y1={122} x2={cx + 24} y2={122} />
          <rect className={`${s.fillBg} ${s.ink3}`} x={cx - 4 + puck[0] * 2} y={118} width={8} height={8} rx={1} />
        </g>
      ))}
      {/* curve box */}
      <rect className={s.ink3} x={214} y={30} width={90} height={90} />
      {GRID.slice(1, 4).map((g) => (
        <g key={g}>
          <line className={s.line} x1={214 + g * 22.5} y1={30} x2={214 + g * 22.5} y2={120} />
          <line className={s.line} x1={214} y1={30 + g * 22.5} x2={304} y2={30 + g * 22.5} />
        </g>
      ))}
      <line className={`${s.line} ${s.dashed}`} x1={214} y1={120} x2={304} y2={30} />
      <path className={s.wave} d="M214 120C236 120 238 98 252 84S280 36 304 30" />
      <path className={s.ink} d="M214 120C240 116 244 86 259 75S286 34 304 30" />
      <circle className={`${s.fillBg} ${s.ink}`} cx={259} cy={75} r={3} />
      {/* curve mode tabs */}
      {GRID.map((g) => (
        <rect key={g} className={g === 0 ? s.ink3 : s.line} x={214 + g * 18} y={132} width={14} height={8} rx={1} />
      ))}
    </Frame>
  );
}
