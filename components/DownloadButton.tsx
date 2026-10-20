"use client";

import { useEffect, useState } from "react";
import { OS_LABEL, detectOS, loadChannels, primaryAsset, type OS, type ReleaseAsset } from "@/lib/release";
import styles from "./DownloadButton.module.css";

type Target = { os: OS; asset: ReleaseAsset; nightly: boolean };

export function DownloadGlyph() {
  return (
    <svg className={styles.glyph} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1v7M2.5 4.5 6 8l3.5-3.5M1.5 10.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

export function DownloadButton({ size = "md" }: { size?: "md" | "sm" }) {
  const [target, setTarget] = useState<Target | null>(null);

  useEffect(() => {
    const os = detectOS(navigator.userAgent, navigator.platform);
    if (!os) return;
    let live = true;
    loadChannels()
      .then(({ official, nightly }) => {
        // The official release when there is one; the nightly build only when no official release exists yet.
        const release = official ?? nightly;
        const asset = release ? primaryAsset(release, os) : null;
        if (live && asset) setTarget({ os, asset, nightly: !official });
      })
      // On failure the button keeps pointing at #download, where the error is shown.
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  const cls = `btn btn-solid${size === "sm" ? " btn-sm" : ""} ${styles.button}`;
  if (!target) {
    return (
      <a className={cls} href="#download">
        <DownloadGlyph />
        Download
      </a>
    );
  }
  return (
    <a className={cls} href={target.asset.url} title={target.asset.name}>
      <DownloadGlyph />
      {target.nightly ? "Download nightly for" : "Download for"} {OS_LABEL[target.os]}
    </a>
  );
}
