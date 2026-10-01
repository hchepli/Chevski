"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SceneClient from "./SceneClient";
import OrbitingMascot from "./OrbitingMascot";
import MagneticButton from "./MagneticButton";

gsap.registerPlugin(useGSAP);

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".nav", { y: -30, opacity: 0, duration: 0.7 })
        .from(".titulo", { y: 40, opacity: 0, duration: 0.8 }, "-=0.4")
        .from(".subtitulo", { y: 30, opacity: 0, duration: 0.8 }, "-=0.6")
        .from(".cena", { scale: 0.85, opacity: 0, duration: 1.1 }, "-=0.5")
        .from(".rodape > *", { y: 20, opacity: 0, stagger: 0.12, duration: 0.6 }, "-=0.5");
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative flex min-h-screen flex-col items-center px-6 pt-28 md:px-10 md:pt-32">
      {/* Título */}
      <h1 className="text-center text-2xl leading-tight md:text-[28px]">
        <span className="titulo block font-bold">Software que sustenta</span>
        <span className="subtitulo block font-light text-[var(--muted)]">o crescimento do seu negócio.</span>
      </h1>

      {/* Palco central */}
      <div className="relative mt-6 w-full max-w-4xl flex-1">
        <div className="cena absolute inset-x-0 top-0 z-10 h-[55vh] min-h-[320px]">
          <SceneClient />
        </div>

        {/* Bloub orbitando (mesma caixa do canvas) */}
        <OrbitingMascot />


      </div>

      {/* Rodapé */}
      <div className="rodape absolute inset-x-6 bottom-8 flex items-end justify-between md:inset-x-10">
        <div className="flex items-center gap-3 text-[11px] font-medium">
          <span>+10 Projetos Entregues</span>
          <div className="flex -space-x-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="h-9 w-9 rounded-full border border-black/15 bg-white"
                style={{ zIndex: 5 - i }}
              />
            ))}
          </div>
        </div>

        <MagneticButton
          as="a"
          href="#contato"
          className="flex items-center gap-6 rounded-full bg-black py-2 pl-7 pr-2 text-sm font-medium text-white"
        >
          COMEÇAR PROJETO
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-black">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </span>
        </MagneticButton>
      </div>
    </section>
  );
}
