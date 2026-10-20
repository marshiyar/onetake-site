import type { ComponentType } from "react";
import SectionBar from "@/components/SectionBar";
import TimelineArt from "@/components/illustrations/TimelineArt";
import ColourArt from "@/components/illustrations/ColourArt";
import GpuArt from "@/components/illustrations/GpuArt";
import KeyframesArt from "@/components/illustrations/KeyframesArt";
import AudioArt from "@/components/illustrations/AudioArt";
import ExportArt from "@/components/illustrations/ExportArt";
import styles from "./Features.module.css";

type Card = { name: string; title: string; text: string; Art: ComponentType };

const CARDS: Card[] = [
  { name: "Timeline", title: "Ripple, split, undo.", text: "Move, trim, split and ripple. The undo history survives a restart.", Art: TimelineArt },
  { name: "Colour", title: "A full grade.", text: "Colour wheels, seven curve modes, secondaries, .cube LUTs and eighteen stylize effects.", Art: ColourArt },
  { name: "GPU", title: "Metal, Vulkan, Direct3D.", text: "The grade runs on the GPU of each system, and on the CPU when there is none.", Art: GpuArt },
  { name: "Keyframes", title: "Animate any parameter.", text: "Keyframes on position, crop and other parameters.", Art: KeyframesArt },
  { name: "Audio", title: "One graph for both.", text: "Playback and export run the same bus and effects graph.", Art: AudioArt },
  { name: "Export", title: "MP4 or MOV with alpha.", text: "Preview and export use the same painter, so what you see is what renders.", Art: ExportArt },
];

export default function Features() {
  return (
    <section id="editing" aria-labelledby="editing-title">
      <SectionBar index="01" title="Editing" note="Drawn by the app, not screenshots" />
      <div className={`frame ${styles.frame}`}>
        <div className={styles.intro}>
          <h2 id="editing-title" className="h2">
            Every cut, <em>by hand</em>.
          </h2>
          <p className={`lede ${styles.lede}`}>A timeline, a grade and an export that agree frame for frame.</p>
        </div>
        <div className={styles.grid}>
          {CARDS.map(({ name, title, text, Art }, i) => (
            <article key={name} className={styles.card}>
              <div className="bar">
                <span className="mono">{name}</span>
                <span className="mono dim">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className={styles.media}>
                <Art />
              </div>
              <div className={styles.text}>
                <h3 className="h3">{title}</h3>
                <p className="body">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Features };
