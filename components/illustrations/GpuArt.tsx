import Frame from "./Frame";
import s from "./illustrations.module.css";

const COLS = [1, 2, 3, 4, 5, 6, 7];
const ROWS = [1, 2, 3];

export default function GpuArt() {
  return (
    <Frame>
      {/* after half: graded */}
      <rect className={s.fillVideo} x={160} y={24} width={120} height={132} />
      {/* grid */}
      {COLS.map((c) => (
        <line key={`c${c}`} className={s.line} x1={40 + c * 30} y1={24} x2={40 + c * 30} y2={156} />
      ))}
      {ROWS.map((r) => (
        <line key={`r${r}`} className={s.line} x1={40} y1={24 + r * 33} x2={280} y2={24 + r * 33} />
      ))}
      {/* the same scene, before and after */}
      <path className={s.ink3} d="M40 132L84 92L112 116L148 74L160 86" />
      <circle className={s.ink3} cx={78} cy={56} r={10} />
      <path className={s.ink} d="M160 86L196 120L232 80L280 128" />
      <circle className={s.wave} cx={238} cy={52} r={10} />
      <rect className={s.ink3} x={40} y={24} width={240} height={132} />
      {/* split handle */}
      <line className={s.accent} x1={160} y1={16} x2={160} y2={164} />
      <rect className={`${s.fillBg} ${s.accent}`} x={154} y={84} width={12} height={12} rx={2} />
      <text className={s.label} x={46} y={36}>BEFORE</text>
      <text className={s.label} x={274} y={36} textAnchor="end">AFTER</text>
    </Frame>
  );
}
