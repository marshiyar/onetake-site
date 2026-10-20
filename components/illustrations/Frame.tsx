import type { ReactNode } from "react";
import s from "./illustrations.module.css";

/** Shared <svg> wrapper: 320x180 (16:9), decorative. */
export default function Frame({ children }: { children: ReactNode }) {
  return (
    <svg className={s.svg} viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}
