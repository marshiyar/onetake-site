"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { REPO_URL } from "@/lib/site";
import GitHubIcon from "./GitHubIcon";
import Mark from "./Mark";
import styles from "./Nav.module.css";

type NavLink = { label: string; href: string; section?: string; external?: boolean };

const LINKS: readonly NavLink[] = [
  { label: "Editing", href: "#editing", section: "editing" },
  { label: "Ownership", href: "#ownership", section: "ownership" },
  { label: "Download", href: "#download", section: "download" },
  { label: "Source", href: REPO_URL, external: true },
];

const SECTION_IDS = LINKS.flatMap((l) => (l.section ? [l.section] : []));

/** Tracks which page section is under the nav: the first (in document order) that crosses the top band. */
function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0 || typeof IntersectionObserver === "undefined") return;

    const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 48;
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        setActive(ids.find((id) => visible.has(id)) ?? null);
      },
      // A band from just under the nav to 45% down the viewport.
      { rootMargin: `-${navH}px 0px -55% 0px`, threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

export default function Nav() {
  const active = useActiveSection(SECTION_IDS);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    const onPointer = (e: PointerEvent) => {
      if (navRef.current && e.target instanceof Node && !navRef.current.contains(e.target)) close(false);
    };
    const mq = window.matchMedia("(min-width: 760px)");
    const onMq = () => {
      if (mq.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    mq.addEventListener("change", onMq);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      mq.removeEventListener("change", onMq);
    };
  }, [open, close]);

  return (
    <header className={styles.nav} ref={navRef}>
      <a href="#top" className={styles.markCell} aria-label="oneTake, back to top">
        <Mark size={20} />
      </a>

      <ul id="nav-links" className={styles.links} data-open={open ? "true" : "false"}>
        {LINKS.map((l) => {
          const isActive = l.section !== undefined && l.section === active;
          return (
            <li key={l.label}>
              <a
                href={l.href}
                className={`mono ${styles.link}`}
                data-active={isActive ? "true" : undefined}
                aria-current={isActive ? "location" : undefined}
                {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
                onClick={() => setOpen(false)}
              >
                {l.label}
                {l.external ? <span className="sr-only"> (opens GitHub in a new tab)</span> : null}
              </a>
            </li>
          );
        })}
      </ul>

      <div className={styles.right}>
        <button
          ref={toggleRef}
          type="button"
          className={`mono ${styles.cell} ${styles.menuBtn}`}
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
        <a
          href={REPO_URL}
          className={`${styles.cell} ${styles.iconCell}`}
          target="_blank"
          rel="noreferrer"
          aria-label="oneTake on GitHub (opens in a new tab)"
        >
          <GitHubIcon size={16} />
        </a>
        <a href="#download" className={`mono ${styles.cta}`}>
          Download
        </a>
      </div>
    </header>
  );
}
