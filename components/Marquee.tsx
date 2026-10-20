import styles from "./Marquee.module.css";

const ITEMS = [
  "Ripple edits",
  "Colour wheels",
  "Curves",
  "LUTs",
  "Keyframes",
  "3D transforms",
  "Text layers",
  "GPU colour",
  "Transparent export",
  "Undo after restart",
] as const;

function Track({ hidden }: { hidden?: boolean }) {
  return (
    <ul className={styles.track} aria-hidden={hidden ? "true" : undefined}>
      {ITEMS.map((item) => (
        <li key={item} className={`mono ${styles.item}`}>
          <span className={styles.dot} aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Full-width strip of feature names scrolling slowly left. The second track is a visual duplicate for the loop. */
export default function Marquee() {
  return (
    <div className={styles.marquee} role="region" aria-label="Features">
      <div className={styles.rail}>
        <Track />
        <Track hidden />
      </div>
    </div>
  );
}

export { Marquee };
