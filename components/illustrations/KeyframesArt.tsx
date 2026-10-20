import Frame from "./Frame";
import s from "./illustrations.module.css";

function Diamond({ x, y, on }: { x: number; y: number; on?: boolean }) {
  return <path className={on ? `${s.fillAccent} ${s.accent}` : `${s.fillBg} ${s.ink3}`} d={`M${x} ${y - 4}L${x + 4} ${y}L${x} ${y + 4}L${x - 4} ${y}Z`} />;
}

const LANES = [
  { y: 104, keys: [96, 168, 252] },
  { y: 128, keys: [120, 216] },
  { y: 152, keys: [80, 144, 200, 280] },
];

export default function KeyframesArt() {
  return (
    <Frame>
      {/* value graph */}
      <line className={s.line} x1={72} y1={22} x2={304} y2={22} />
      <line className={s.line} x1={72} y1={78} x2={304} y2={78} />
      <line className={`${s.line} ${s.dashed}`} x1={88} y1={70} x2={200} y2={30} />
      <path className={s.accent} d="M88 70C130 70 158 30 200 30H296" />
      <line className={s.line} x1={88} y1={70} x2={124} y2={70} />
      <line className={s.line} x1={164} y1={30} x2={200} y2={30} />
      <circle className={`${s.fillBg} ${s.ink3}`} cx={124} cy={70} r={2} />
      <circle className={`${s.fillBg} ${s.ink3}`} cx={164} cy={30} r={2} />
      <Diamond x={88} y={70} on />
      <Diamond x={200} y={30} on />
      {/* property lanes */}
      {LANES.map((l) => (
        <g key={l.y}>
          <line className={s.ink3} x1={16} y1={l.y} x2={48} y2={l.y} />
          <line className={s.line} x1={72} y1={l.y} x2={304} y2={l.y} />
          {l.keys.map((k) => (
            <Diamond key={k} x={k} y={l.y} />
          ))}
        </g>
      ))}
      <line className={s.line} x1={64} y1={16} x2={64} y2={164} />
      <line className={`${s.ink3} ${s.dashed}`} x1={232} y1={16} x2={232} y2={164} />
    </Frame>
  );
}
