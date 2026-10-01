import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Preloader from "@/components/Preloader";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Preloader />
      <Navbar />
      <Hero />
    </main>
  );
}
