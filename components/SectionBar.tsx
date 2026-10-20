import styles from "./SectionBar.module.css";

type SectionBarProps = {
  /** Two-digit section number, e.g. "01". */
  index: string;
  title: string;
  /** Optional right-aligned note. */
  note?: string;
};

/**
 * Section header strip: a full-bleed hairline on top, then the 42px .bar inside the frame.
 * Place it directly in the page flow (not nested in another .frame).
 */
export default function SectionBar({ index, title, note }: SectionBarProps) {
  return (
    <div className={styles.wrap}>
      <div className={`frame bar ${styles.bar}`}>
        <span className={`mono ${styles.label}`}>
          <span className="dim">{index}</span>
          <span className={`dim ${styles.slash}`} aria-hidden="true">/</span>
          <span>{title}</span>
        </span>
        {note ? <span className={`mono dim ${styles.note}`}>{note}</span> : null}
      </div>
    </div>
  );
}
