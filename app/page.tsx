import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Features } from "@/components/Features";
import { Ownership } from "@/components/Ownership";
import { Downloads } from "@/components/Downloads";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { ScrollRuler } from "@/components/ScrollRuler";
import { DownloadButton } from "@/components/DownloadButton";

export default function Home() {
  return (
    <>
      <Nav />
      <ScrollRuler />
      <main id="top">
        <Hero>
          <DownloadButton />
        </Hero>
        <Marquee />
        <Features />
        <Ownership />
        <Downloads />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
