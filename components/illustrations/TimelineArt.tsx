import Frame from "./Frame";
import s from "./illustrations.module.css";

const TICKS = Array.from({ length: 19 }, (_, i) => 24 + i * 16);

// A deterministic waveform: vertical strokes either side of the audio clip's centre line.
const WAVE = Array.from({ length: 48 }, (_, i) => {
  const x = 26 + i * 4;
  const a = Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23)) * 10 + 1.5;
  return `M${x} ${129 - a}V${129 + a}`;
}).join("");

export default function TimelineArt() {
  return (
    <Frame>
      {/* ruler */}
      <line className={s.line} x1={16} y1={26} x2={304} y2={26} />
      {TICKS.map((x, i) => (
        <line key={x} className={i % 4 === 0 ? s.ink3 : s.line} x1={x} y1={i % 4 === 0 ? 14 : 20} x2={x} y2={26} />
      ))}
      {/* track separators */}
      <line className={s.line} x1={16} y1={64} x2={304} y2={64} />
      <line className={s.line} x1={16} y1={104} x2={304} y2={104} />
      <line className={s.line} x1={16} y1={154} x2={304} y2={154} />
      {/* V2 */}
      <rect className={`${s.fillVideo} ${s.line}`} x={64} y={36} width={72} height={22} rx={2} />
      {/* V1, split at the playhead */}
      <rect className={`${s.fillVideo} ${s.line}`} x={20} y={72} width={130} height={26} rx={2} />
      <rect className={`${s.fillVideo} ${s.line}`} x={152} y={72} width={78} height={26} rx={2} />
      {/* rippled gap: the ghost of a deleted clip, closing left */}
      <rect className={`${s.ink3} ${s.dashed}`} x={234} y={72} width={44} height={26} rx={2} />
      <path className={s.ink3} d="M268 85H244M249 81l-5 4 5 4" />
      {/* A1 */}
      <rect className={`${s.fillAudio} ${s.line}`} x={20} y={112} width={210} height={34} rx={2} />
      <path className={s.wave} d={WAVE} />
      {/* playhead */}
      <path className={s.fillAccent} d="M145 10h10v6l-5 5-5-5z" />
      <line className={s.accent} x1={150} y1={20} x2={150} y2={166} />
    </Frame>
  );
}
