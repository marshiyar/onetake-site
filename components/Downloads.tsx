"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { SectionBar } from "@/components/SectionBar";
import { RELEASES_URL, REPO_URL, UNSIGNED_NOTES } from "@/lib/site";
import {
  OS_LABEL,
  assetsFor,
  detectOS,
  formatDate,
  formatSize,
  loadChannels,
  version,
  type Channel,
  type Channels,
  type OS,
  type Release,
} from "@/lib/release";
import styles from "./Downloads.module.css";

type State = { status: "loading" } | { status: "ready"; channels: Channels } | { status: "error"; message: string };

const COLUMNS: { os: OS; note: string }[] = [
  { os: "mac", note: "Apple silicon · macOS 15 or later" },
  { os: "windows", note: "64-bit · Windows 10 or 11" },
  { os: "linux", note: "64-bit · .deb for Ubuntu 24.04+ / Debian 13" },
];

const TABS: { channel: Channel; label: string; description: string }[] = [
  { channel: "official", label: "Official", description: "Tested releases. Recommended." },
  { channel: "nightly", label: "Nightly", description: "Built from the latest code every day. May have bugs." },
];

function summary(release: Release): string {
  const { version: v, build } = version(release);
  const parts = [v ? `Version ${v}` : null, build ? `build ${build}` : null, formatDate(release.publishedAt) || null].filter(
    (p): p is string => p !== null,
  );
  return parts.length ? `${parts.join(", ")}.` : release.name;
}

function Columns({ state, release, mine }: { state: State; release: Release | null; mine: OS | null }) {
  const loading = state.status === "loading";
  return (
    <div className={styles.grid}>
      {COLUMNS.map(({ os, note }) => {
        const assets = release ? assetsFor(release, os) : [];
        const unsigned = UNSIGNED_NOTES[os];
        return (
          <div key={os} className={styles.col}>
            <div className={`mono ${styles.colBar}`}>
              <h3 className={styles.osName}>{OS_LABEL[os]}</h3>
              {mine === os && <span className={styles.yours}>Your system</span>}
            </div>
            <ul className={styles.rows} aria-busy={loading}>
              {loading ? (
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
            <div className={styles.notes}>
              <p className={`mono dim ${styles.note}`}>{note}</p>
              {unsigned && <p className={`mono dim ${styles.note}`}>{unsigned}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Downloads() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [mine, setMine] = useState<OS | null>(null);
  const [picked, setPicked] = useState<Channel | null>(null);
  const tabRefs = useRef<Record<Channel, HTMLButtonElement | null>>({ official: null, nightly: null });

  useEffect(() => {
    setMine(detectOS(navigator.userAgent, navigator.platform));
    let live = true;
    loadChannels().then(
      (channels) => live && setState({ status: "ready", channels }),
      (err: unknown) => live && setState({ status: "error", message: err instanceof Error ? err.message : String(err) }),
    );
    return () => {
      live = false;
    };
  }, []);

  // Until the visitor picks, show Official when one exists, otherwise Nightly.
  const channels = state.status === "ready" ? state.channels : null;
  const active: Channel = picked ?? (channels && !channels.official ? "nightly" : "official");
  const release = channels ? channels[active] : null;
  const tab = TABS.find((t) => t.channel === active) ?? TABS[0];

  function select(channel: Channel, focus: boolean) {
    setPicked(channel);
    if (focus) tabRefs.current[channel]?.focus();
  }

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    select(TABS[next].channel, true);
  }

  return (
    <section id="download" aria-labelledby="download-title">
      <SectionBar index="03" title="Download" note="Official and nightly" />
      <div className="frame">
        <div className={styles.head}>
          <h2 id="download-title" className="h2">
            Get <em>oneTake</em>.
          </h2>
          <div className={styles.channel}>
            <div className={styles.tabs} role="tablist" aria-label="Kind of build">
              {TABS.map((t, i) => (
                <button
                  key={t.channel}
                  ref={(el) => {
                    tabRefs.current[t.channel] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`dl-tab-${t.channel}`}
                  aria-selected={active === t.channel}
                  aria-controls="dl-panel"
                  tabIndex={active === t.channel ? 0 : -1}
                  className={`mono ${styles.tab}`}
                  onClick={() => select(t.channel, false)}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="body">{tab.description}</p>
          </div>
        </div>

        <div id="dl-panel" role="tabpanel" aria-labelledby={`dl-tab-${active}`}>
          {state.status === "error" ? (
            <div className={styles.box} role="alert">
              <div>
                <p className="body">Couldn&rsquo;t load the releases from GitHub.</p>
                <p className={`mono dim ${styles.errorDetail}`}>{state.message}</p>
              </div>
              <a className="btn btn-line btn-sm" href={RELEASES_URL}>
                All releases
              </a>
            </div>
          ) : state.status === "ready" && !release ? (
            <div className={styles.box}>
              {active === "official" ? (
                <>
                  <p className="body">No official release yet.</p>
                  {state.channels.nightly && (
                    <button type="button" className="btn btn-line btn-sm" onClick={() => select("nightly", true)}>
                      Get the nightly build
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="body">No nightly build yet.</p>
                  <a className="btn btn-line btn-sm" href={RELEASES_URL}>
                    All releases
                  </a>
                </>
              )}
            </div>
          ) : (
            <>
              <Columns state={state} release={release} mine={mine} />
              <p className={`body ${styles.summary}`} aria-live="polite">
                {release ? summary(release) : " "}
              </p>
            </>
          )}
        </div>

        <p className={`mono dim ${styles.links}`}>
          <a href={RELEASES_URL}>All releases</a>
          <span aria-hidden="true">·</span>
          <a href={REPO_URL}>Source</a>
        </p>
      </div>
    </section>
  );
}
