import { GitHubIcon } from "@/components/GitHubIcon";
import { SectionBar } from "@/components/SectionBar";
import { REPO_URL } from "@/lib/site";
import styles from "./Ownership.module.css";

const ITEMS = [
  {
    letter: "A",
    title: "Open source app",
    body: "The editor is MIT or Apache-2.0 on GitHub. The media and keyframe engines ship prebuilt.",
    source: true,
  },
  { letter: "B", title: "No account", body: "Download, open, edit. Nothing to sign in to.", source: false },
  {
    letter: "C",
    title: "Plain project files",
    body: "A project is a folder with one JSON document. Back it up, diff it, keep it.",
    source: false,
  },
];

export function Ownership() {
  return (
    <section id="ownership" aria-labelledby="ownership-title">
      <SectionBar index="02" title="Ownership" note="Your files stay yours" />
      <div className="frame">
        <div className={styles.head}>
          <h2 id="ownership-title" className="h2">
            Your work, <em>your machine</em>.
          </h2>
          <p className="lede">No account, no subscription, nothing between you and your footage.</p>
        </div>
        <ul className={styles.grid}>
          {ITEMS.map((item) => (
            <li key={item.letter} className={styles.cell}>
              <span className="mono dim" aria-hidden="true">
                {item.letter}
              </span>
              <h3 className="h3">{item.title}</h3>
              <p className="body">{item.body}</p>
              {item.source && (
                <a className={`btn btn-line btn-sm ${styles.source}`} href={REPO_URL}>
                  <GitHubIcon size={14} />
                  View source
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
