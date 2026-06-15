import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import Features from "@/app/components/Features";
import Trending from "@/app/components/Trending";
import CreatorBanner from "@/app/components/CreatorBanner";
import TopCreators from "@/app/components/TopCreators";
import BackgroundEffects from "@/app/components/BackgroundEffects";
import FadeUp from "@/app/components/FadeUp";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07080f] text-white">
      <BackgroundEffects />
      <Navbar />
      <Hero />
      <FadeUp>
        <Features />
      </FadeUp>
      <FadeUp>
        <Trending />
      </FadeUp>
      <FadeUp>
        <CreatorBanner />
      </FadeUp>
      <FadeUp>
        <TopCreators />
      </FadeUp>
      <Footer />
    </main>
  );
}
