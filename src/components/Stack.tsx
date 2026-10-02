"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FAIXA_A = ["GSAP", "Three.js", "Next.js", "React", "Vue", "JavaScript", "TypeScript"];
const FAIXA_B = ["Python", "Django", "Node.js", "PostgreSQL", "Tailwind", "Docker", "Figma"];

// Uma metade da faixa = lista repetida 2x (garante largura maior que a faixa).
// A faixa renderiza 2 metades e anima -50% → loop sem emenda.
function Metade({ items, hidden }: { items: string[]; hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden}>
      {[...items, ...items].map((name, i) => (
        <li
          key={i}
          className="flex items-center gap-8 pr-8 text-3xl font-bold md:gap-14 md:pr-14 md:text-6xl"
        >
          <span className="whitespace-nowrap">{name}</span>
          <span aria-hidden className="h-2 w-2 rounded-full bg-current md:h-3 md:w-3" />
        </li>
      ))}
    </ul>
  );
}

export default function Stack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const marquees = gsap.utils.toArray<HTMLElement>(".marquee", root.current);

        const tweens = marquees.map((el) => {
          const dir = Number(el.dataset.dir); // -1 → esquerda | 1 → direita
          return gsap.fromTo(
            el,
            { xPercent: dir < 0 ? 0 : -50 },
            { xPercent: dir < 0 ? -50 : 0, ease: "none", duration: 40, repeat: -1 }
          );
        });

        // as faixas aceleram quando o usuário scrolla e voltam ao normal
        let target = 1;
        let current = 1;
        const tick = () => {
          target += (1 - target) * 0.05;
          current += (target - current) * 0.08;
          tweens.forEach((t) => t.timeScale(current));
        };
        gsap.ticker.add(tick);

        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            target = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 5);
          },
        });

        return () => {
          gsap.ticker.remove(tick);
          st.kill();
        };
      });

      // ângulo das faixas: mais inclinado no mobile pra manter o X
      const setAngles = () => {
        const a = window.innerWidth < 768 ? 10 : 5;
        gsap.set(".faixa-a", { xPercent: -50, yPercent: -50, rotation: a });
        gsap.set(".faixa-b", { xPercent: -50, yPercent: -50, rotation: -a });
      };
      setAngles();
      window.addEventListener("resize", setAngles);

      return () => {
        window.removeEventListener("resize", setAngles);
        mm.revert();
      };
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="stack"
      className="relative px-6 py-24 md:px-10 md:py-32"
    >
      <h2 className="text-center text-2xl leading-tight md:text-[43px]">
        <span className="block font-bold">As tecnologias que usamos</span>
        <span className="block font-light text-[var(--muted)]">
          para tirar o seu projeto do papel.
        </span>
      </h2>

      {/* Palco do X (full-bleed, ignora o padding da seção) */}
      <div className="relative -mx-6 mt-10 h-[62vh] min-h-[420px] overflow-hidden md:-mx-10 md:mt-16 md:h-[75vh]">
        {/* Faixa A — preta */}
        <div className="faixa-a absolute left-1/2 top-1/2 w-[190vw] overflow-hidden bg-black py-4 text-white md:py-6">
          <div className="marquee flex w-max" data-dir="-1">
            <Metade items={FAIXA_A} />
            <Metade items={FAIXA_A} hidden />
          </div>
        </div>

        {/* Faixa B — branca, por cima, cruzando a A */}
        <div className="faixa-b absolute left-1/2 top-1/2 w-[190vw] overflow-hidden border-y-2 border-black bg-white py-4 text-black md:py-6">
          <div className="marquee flex w-max" data-dir="1">
            <Metade items={FAIXA_B} />
            <Metade items={FAIXA_B} hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
