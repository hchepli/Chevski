"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SceneClient from "./SceneClient";
import OrbitingMascot from "./OrbitingMascot";
import { useMascot } from "./mascot";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(useGSAP);

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const { setMood } = useMascot();

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      // Para animar a Navbar, coloque className="nav" no elemento raiz dela e
      // adicione aqui: tl.from(".nav", { y: -30, opacity: 0, duration: 0.7 })
      tl.from(".titulo", { y: 40, opacity: 0, duration: 0.8 })
        .from(".subtitulo", { y: 30, opacity: 0, duration: 0.8 }, "-=0.6")
        .from(".cena", { scale: 0.85, opacity: 0, duration: 1.1 }, "-=0.5")
        .from(".rodape > *", { y: 20, opacity: 0, stagger: 0.12, duration: 0.6 }, "-=0.5");
    },
    { scope: root }
  );

  return (
    <section
  ref={root}
  className="relative flex min-h-screen flex-col items-center px-6 pb-44 pt-28 md:px-10 md:pb-0 md:pt-32"
>
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
{/* Rodapé */}
<div className="rodape absolute inset-x-6 bottom-8 flex flex-col items-stretch gap-4 md:inset-x-10 md:flex-row md:items-end md:justify-between">
  <div className="flex items-center gap-3 text-[11px] font-medium">
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
