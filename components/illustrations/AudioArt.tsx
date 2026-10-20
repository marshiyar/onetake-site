import Frame from "./Frame";
import s from "./illustrations.module.css";

function Box({ x, y, w, h, label, strong }: { x: number; y: number; w: number; h: number; label: string; strong?: boolean }) {
  return (
    <g>
      <rect className={`${s.fillRaised} ${strong ? s.accent : s.ink3}`} x={x} y={y} width={w} height={h} rx={2} />
      <text className={s.label} x={x + w / 2} y={y + h / 2 + 2.5} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

const SEGMENTS = Array.from({ length: 10 }, (_, i) => i);

export default function AudioArt() {
  return (
    <Frame>
      {/* wires */}
      <path className={s.line} d="M64 47H82M64 103H82M126 47H138V75H150M126 103H138V75M206 75H222V43H240M222 75V107H240" />
      <Box x={16} y={36} w={48} h={22} label="A1" />
      <Box x={16} y={92} w={48} h={22} label="A2" />
      <Box x={82} y={36} w={44} h={22} label="EQ" />
      <Box x={82} y={92} w={44} h={22} label="COMP" />
      <Box x={150} y={56} w={56} h={38} label="BUS" strong />
      <Box x={240} y={32} w={64} h={22} label="PLAY" />
      <Box x={240} y={96} w={64} h={22} label="EXPORT" />
      {/* meters */}
      {[134, 144].map((y, row) =>
        SEGMENTS.map((i) => (
          <rect
            key={`${y}-${i}`}
            className={i < (row === 0 ? 7 : 6) ? s.fillWave : s.fillLine}
            x={110 + i * 10}
            y={y}
            width={8}
            height={5}
          />
        )),
      )}
      <text className={s.label} x={104} y={143} textAnchor="end">L R</text>
    </Frame>
  );
}
