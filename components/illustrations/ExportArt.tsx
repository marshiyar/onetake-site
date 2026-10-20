import Frame from "./Frame";
import s from "./illustrations.module.css";

const CELL = 10;
// Checkerboard behind the frame: the transparent parts of a MOV with alpha.
const CHECKS = Array.from({ length: 10 * 18 }, (_, i) => ({ c: i % 18, r: Math.floor(i / 18) })).filter(({ c, r }) => (c + r) % 2 === 0);

export default function ExportArt() {
  return (
    <Frame>
      <g>
        {CHECKS.map(({ c, r }) => (
          <rect key={`${c}-${r}`} className={s.fillLine} x={70 + c * CELL} y={18 + r * CELL} width={CELL} height={CELL} />
        ))}
      </g>
      <rect className={s.ink3} x={70} y={18} width={180} height={100} />
      {/* the layers that keep their alpha */}
      <rect className={`${s.fillVideo} ${s.line}`} x={92} y={78} width={96} height={22} rx={2} />
      <line className={s.ink} x1={100} y1={89} x2={150} y2={89} />
      <circle className={s.accent} cx={206} cy={52} r={18} />
      {/* corner handles */}
      {[
        [70, 18],
        [250, 18],
        [70, 118],
        [250, 118],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} className={`${s.fillBg} ${s.ink3}`} x={x - 3} y={y - 3} width={6} height={6} />
      ))}
      {/* formats */}
      <rect className={s.ink3} x={70} y={136} width={86} height={22} />
      <text className={s.label} x={113} y={149.5} textAnchor="middle">MP4 · H.264</text>
      <rect className={s.accent} x={164} y={136} width={86} height={22} />
      <text className={s.label} x={207} y={149.5} textAnchor="middle">MOV</text>
    </Frame>
  );
}
