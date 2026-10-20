import { DownloadButton } from "@/components/DownloadButton";
import { REPO_URL } from "@/lib/site";
import styles from "./FinalCta.module.css";

export function FinalCta() {
  return (
    <section className={styles.section} aria-labelledby="final-cta-title">
      <div className={`frame ${styles.inner}`}>
        <p className="mono dim">Free · macOS · Windows · Linux</p>
        <h2 id="final-cta-title" className="h2-xl">
          Start <em>cutting</em>.
        </h2>
        <p className={`lede ${styles.lede}`}>Download the editor and open your first project.</p>
        <div className={styles.actions}>
          <DownloadButton />
          <a className="btn btn-line" href={REPO_URL}>
            View source
          </a>
        </div>
      </div>
    </section>
  );
}
