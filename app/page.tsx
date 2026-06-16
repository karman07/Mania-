import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import FreeBanner from "@/app/components/FreeBanner";
import FeaturedSection from "@/app/components/FeaturedSection";
import CharacterShowcase from "@/app/components/CharacterShowcase";
import GenreGrid from "@/app/components/GenreGrid";
import StatsSection from "@/app/components/StatsSection";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FreeBanner />
        <FeaturedSection />
        <CharacterShowcase />
        <GenreGrid />
        <StatsSection />
      </main>
      <Footer />
    </>
  );
}
