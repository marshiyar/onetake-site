import styles from "./SectionBar.module.css";

type SectionBarProps = {
  /** Two-digit section number, e.g. "01". */
  index: string;
  title: string;
  /** Optional right-aligned note. */
  note?: string;
};

/** Section header strip: the 42px .bar. Place it as the first child of a `.frame` section. */
export function SectionBar({ index, title, note }: SectionBarProps) {
  return (
    <div className={`bar ${styles.bar}`}>
      <span className={`mono ${styles.label}`}>
        <span className="dim">{index}</span>
        <span className={`dim ${styles.slash}`} aria-hidden="true">/</span>
        <span>{title}</span>
      </span>
      {note ? <span className={`mono dim ${styles.note}`}>{note}</span> : null}
    </div>
  );
}

export default SectionBar;
