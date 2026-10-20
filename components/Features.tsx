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
  { name: "Timeline", title: "Ripple, split, undo.", text: "Move, trim, split and ripple-delete. Undo still works after you close and reopen a project.", Art: TimelineArt },
  { name: "Colour", title: "A full colour grade.", text: "Colour wheels, curves, LUTs and 18 looks and effects.", Art: ColourArt },
  { name: "GPU", title: "Colour on the graphics card.", text: "Grading runs on your graphics card on every system, and still works on computers without one.", Art: GpuArt },
  { name: "Keyframes", title: "Animate position, crop and more.", text: "Set keyframes by dragging on the canvas or in the timeline.", Art: KeyframesArt },
  { name: "Audio", title: "Hear what you export.", text: "Playback and export use the same mix and the same audio effects.", Art: AudioArt },
  { name: "Export", title: "MP4, or MOV with transparency.", text: "The export is drawn exactly like the preview, so what you see is what you get.", Art: ExportArt },
];

export default function Features() {
  return (
    <section id="editing" aria-labelledby="editing-title">
      <SectionBar index="01" title="Editing" note="What the editor does" />
      <div className={`frame ${styles.frame}`}>
        <div className={styles.intro}>
          <h2 id="editing-title" className="h2">
            Every cut, <em>by hand</em>.
          </h2>
          <p className={`lede ${styles.lede}`}>Cut on the timeline, grade the colour, export what you see.</p>
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
