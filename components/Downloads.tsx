"use client";

import { useEffect, useState } from "react";
import { SectionBar } from "@/components/SectionBar";
import { RELEASES_URL, REPO_URL } from "@/lib/site";
import { OS_LABEL, assetsFor, detectOS, formatDate, formatSize, loadLatestRelease, version, type OS, type Release } from "@/lib/release";
import styles from "./Downloads.module.css";

type State = { status: "loading" } | { status: "ready"; release: Release } | { status: "error"; message: string };

const COLUMNS: { os: OS; note: string }[] = [
  { os: "mac", note: "Apple silicon · macOS 15 or later" },
  { os: "windows", note: "64-bit · Windows 10 or 11" },
  { os: "linux", note: "64-bit · .deb for Ubuntu 24.04+ / Debian 13" },
];

function summary(release: Release): string {
  const { version: v, build } = version(release);
  const parts = [v ? `Version ${v}` : null, build ? `build ${build}` : null, formatDate(release.publishedAt) || null].filter(
    (p): p is string => p !== null,
  );
  return parts.length ? `${parts.join(", ")}.` : release.name;
}

export function Downloads() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [mine, setMine] = useState<OS | null>(null);

  useEffect(() => {
    setMine(detectOS(navigator.userAgent, navigator.platform));
    let live = true;
    loadLatestRelease().then(
      (release) => live && setState({ status: "ready", release }),
      (err: unknown) => live && setState({ status: "error", message: err instanceof Error ? err.message : String(err) }),
    );
    return () => {
      live = false;
    };
  }, []);

  return (
    <section id="download" aria-labelledby="download-title">
      <SectionBar index="03" title="Download" note="Latest build" />
      <div className="frame">
        <div className={styles.head}>
          <h2 id="download-title" className="h2">
            Get <em>oneTake</em>.
          </h2>
          <p className={`lede ${styles.lede}`} aria-live="polite">
            {state.status === "ready" ? summary(state.release) : "\u00a0"}
          </p>
        </div>

        {state.status === "error" ? (
          <div className={styles.error} role="alert">
            <div>
              <p className="body">Couldn&rsquo;t load the latest release from GitHub.</p>
              <p className={`mono dim ${styles.errorDetail}`}>{state.message}</p>
            </div>
            <a className="btn btn-line btn-sm" href={RELEASES_URL}>
              All releases
            </a>
          </div>
        ) : (
          <div className={styles.grid}>
            {COLUMNS.map(({ os, note }) => {
              const assets = state.status === "ready" ? assetsFor(state.release, os) : [];
              return (
                <div key={os} className={styles.col}>
                  <div className={`mono ${styles.colBar}`}>
                    <h3 className={styles.osName}>{OS_LABEL[os]}</h3>
                    {mine === os && <span className={styles.yours}>Your system</span>}
                  </div>
                  <ul className={styles.rows} aria-busy={state.status === "loading"}>
                    {state.status === "loading" ? (
                      <>
                        <li className={styles.row} aria-hidden="true">
                          <span className={styles.skel} />
                        </li>
                        <li className={styles.row} aria-hidden="true">
                          <span className={styles.skel} />
                        </li>
                      </>
                    ) : assets.length === 0 ? (
                      <li className={`${styles.row} mono dim`}>No build in this release</li>
                    ) : (
                      assets.map((a) => (
                        <li key={a.name} className={styles.row}>
                          <span className={styles.kind}>{a.kind}</span>
                          <span className={`mono dim ${styles.size}`}>{formatSize(a.size)}</span>
                          <a
                            className="btn btn-line btn-sm"
                            href={a.url}
                            title={a.name}
                            aria-label={`Download ${OS_LABEL[os]} ${a.kind}, ${formatSize(a.size)}`}
                          >
                            Download
                          </a>
                        </li>
                      ))
                    )}
                  </ul>
                  <p className={`mono dim ${styles.note}`}>{note}</p>
                </div>
              );
            })}
          </div>
        )}

        <p className={`mono dim ${styles.links}`}>
          <a href={RELEASES_URL}>All releases</a>
          <span aria-hidden="true">·</span>
          <a href={REPO_URL}>Source</a>
        </p>
      </div>
    </section>
  );
}
