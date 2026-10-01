import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Preloader from "@/components/Preloader";
import ContactSection from "@/components/ContactSection";
import { MascotProvider } from "@/components/mascot";
import ProjectSection from "@/components/ProjectSection";

export default function Home() {
  return (
    <MascotProvider>
      <main className="relative overflow-hidden">
        <Preloader />
        <Navbar />
        <Hero />
        <ProjectSection />
        <ContactSection />
      </main>
    </MascotProvider>
  );
}