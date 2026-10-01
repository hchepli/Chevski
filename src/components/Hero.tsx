"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SceneClient from "./SceneClient";
import OrbitingMascot from "./OrbitingMascot";
import { useMascot } from "./mascot";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(useGSAP);

type PlWindow = Window & { __plReveal?: boolean };

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const { setMood } = useMascot();

  useGSAP(
    () => {
      // começa pausada: só toca quando o preloader libera o site
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      // IMPORTANTE: sem scale no .cena, senão o Canvas mede o tamanho errado
      tl.from(".titulo", { y: 40, opacity: 0, duration: 0.8 })
        .from(".subtitulo", { y: 30, opacity: 0, duration: 0.8 }, "-=0.6")
        .from(".cena", { opacity: 0, duration: 1.1 }, "-=0.5")
        .from(".rodape > *", { y: 20, opacity: 0, stagger: 0.12, duration: 0.6 }, "-=0.5");

      const play = () => {
        tl.play();
      };

      if ((window as PlWindow).__plReveal) {
        play();
      } else {
        window.addEventListener("preloader:reveal", play, { once: true });
        window.addEventListener("preloader:done", play, { once: true });
      }

      return () => {
        window.removeEventListener("preloader:reveal", play);
        window.removeEventListener("preloader:done", play);
      };
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative flex min-h-screen flex-col items-center px-6 pb-44 pt-28 md:px-10 md:pb-8 md:pt-32"
    >
      {/* Título */}
      <h1 className="text-center text-2xl leading-tight md:text-[43px]">
        <span className="titulo block font-bold">Software que sustenta</span>
        <span className="subtitulo block font-light text-[var(--muted)]">
          o crescimento do seu negócio.
        </span>
      </h1>

      {/* Palco: altura fixa (sem flex-1), então o rodapé sobe até a sombra */}
      <div className="relative mt-2 h-[60vh] min-h-[420px] w-full">
        <div className="cena absolute inset-0 z-10">
          <SceneClient />
        </div>

        <OrbitingMascot />
      </div>

      {/* Rodapé (ajuste o mt-2 para mais ou menos distância da sombra) */}
      <div className="rodape mt-2 flex w-full flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-[12px] font-medium">
          <span className="whitespace-nowrap">+10 Projetos Entregues</span>
          <div className="flex -space-x-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="h-9 w-9 shrink-0 rounded-full border border-black/15 bg-white"
                style={{ zIndex: 5 - i }}
              />
            ))}
          </div>
        </div>

        <a
          href="#contato"
          className="group relative flex w-full items-center justify-between overflow-hidden rounded-full border-2 border-black bg-black py-2 pl-7 pr-2 text-sm font-medium text-white md:w-fit md:justify-start"
        >
          <span className="whitespace-nowrap">COMEÇAR PROJETO</span>

          {/* Espaço reservado para o círculo */}
          <span className="h-11 w-11 shrink-0 md:ml-6" aria-hidden />

          <span className="absolute bottom-2 right-2 top-2 grid w-11 place-items-center rounded-full bg-white text-black transition-all duration-500 ease-in-out group-hover:w-[calc(100%-1rem)]">
            <ArrowUpRight size={18} strokeWidth={2} />
          </span>
        </a>
      </div>
    </section>
  );
}