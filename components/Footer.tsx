import { RELEASES_URL, REPO_URL } from "@/lib/site";
import Mark from "./Mark";
import styles from "./Footer.module.css";

type FooterLink = { label: string; href: string };
type FooterColumn = { heading: string; links: readonly FooterLink[] };

const COLUMNS: readonly FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Download", href: "#download" },
      { label: "Releases", href: RELEASES_URL },
    ],
  },
  {
    heading: "Source",
    links: [
      { label: "GitHub", href: REPO_URL },
      { label: "Issues", href: `${REPO_URL}/issues` },
      { label: "License", href: `${REPO_URL}/blob/main/LICENSE` },
    ],
  },
  {
    heading: "Docs",
    links: [
      { label: "Status", href: `${REPO_URL}/blob/main/mpvfx-swift/docs/STATUS.md` },
      { label: "Features", href: `${REPO_URL}/blob/main/mpvfx-swift/docs/FEATURES.md` },
    ],
  },
];

const isExternal = (href: string) => /^https?:\/\//.test(href);

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`frame ${styles.grid}`}>
        <div className={`${styles.col} ${styles.brand}`}>
          <Mark size={28} title="oneTake" />
          <p className={styles.tagline}>A native video editor for macOS, Windows and Linux.</p>
          <p className="mono dim">MIT OR APACHE-2.0 · ENGINES PREBUILT</p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.heading} className={styles.col} aria-label={col.heading}>
            <h2 className={`mono dim ${styles.heading}`}>{col.heading}</h2>
            <ul className={styles.list}>
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className={styles.link}
                    {...(isExternal(l.href) ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className={styles.bottomWrap}>
        <div className={`frame ${styles.bottom}`}>
          <span className="mono dim">© 2026 ARSHIYA RAHGOZAR</span>
          <span className="mono dim">BUILT IN SWIFT</span>
        </div>
      </div>
    </footer>
  );
}
