"use client";
import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Service = {
  title: string;
  text: string;
  imagem?: string; // quando tiver a foto/print do sistema: "/servicos/web.webp"
  cor: string; // gradiente de placeholder
};

// DADOS DE EXEMPLO: troque as imagens por prints de projetos reais
const SERVICES: Service[] = [
  {
    title: "Sistemas web sob medida",
    text: "Plataformas, portais e sistemas internos feitos para a rotina da sua empresa e prontos para crescer.",
    cor: "from-[#0f766e] to-[#5eead4]",
  },
  {
    title: "Apps mobile",
    text: "Aplicativos para iOS e Android com a cara da sua marca, rápidos e fáceis de usar.",
    cor: "from-[#3b2a8f] to-[#7b6cf0]",
  },
  {
    title: "Dashboards e BI",
    text: "Seus dados em painéis claros, para decidir com números e não no achismo.",
    cor: "from-[#1e3a8a] to-[#93c5fd]",
  },
  {
    title: "Integrações e ERP",
    text: "Conectamos sistemas, planilhas e ferramentas para os dados pararem de ser digitados duas vezes.",
    cor: "from-[#9a3412] to-[#fdba74]",
  },
  {
    title: "Automações",
    text: "Tarefas repetitivas viram rotinas automáticas: menos erro e menos horas perdidas.",
    cor: "from-[#831843] to-[#f9a8d4]",
  },
  {
    title: "UX/UI Design",
    text: "Interfaces pensadas com quem vai usar, validadas no Figma antes de qualquer linha de código.",
    cor: "from-[#334155] to-[#94a3b8]",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

/* Imagem do serviço: foto quando existir, gradiente enquanto isso */
function Media({ s, i, className }: { s: Service; i: number; className: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${s.cor} ${className}`}
    >
      {s.imagem ? (
        <Image src={s.imagem} alt={s.title} fill className="object-cover" />
      ) : (
        <span className="absolute bottom-2 left-3 text-3xl font-bold text-white/30">
          {pad(i + 1)}
        </span>
      )}
    </div>
  );
}

export default function Services() {
  const root = useRef<HTMLElement>(null);

  /* ───────── Tela fixa: o scroll só abre o próximo serviço ───────── */
  useGSAP(
    () => {
      const el = root.current!;
      const rows = gsap.utils.toArray<HTMLElement>(".row", el);
      const counter = el.querySelector<HTMLElement>(".counter");
      const fill = el.querySelector<HTMLElement>(".fill");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const n = rows.length;

      // sem animação: todos abertos, sem pin
      if (reduce) {
        rows.forEach((r) => r.setAttribute("data-active", "true"));
        return;
      }

      let cur = -1;
      const go = (i: number) => {
        if (i === cur) return;
        cur = i;
        rows.forEach((r, j) => r.setAttribute("data-active", String(j === i)));
        if (counter) counter.textContent = pad(i + 1);
      };
      go(0);

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => "+=" + (n - 1) * window.innerHeight * 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // remova o snap se preferir scroll 100% livre
        snap: {
          snapTo: 1 / (n - 1),
          duration: { min: 0.2, max: 0.5 },
          delay: 0.05,
        },
        onUpdate: (self) => {
          go(Math.round(self.progress * (n - 1)));
          if (fill) fill.style.transform = `scaleX(${self.progress})`;
        },
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="servicos"
      className="relative flex h-screen flex-col overflow-hidden px-6 pb-20 pt-32 md:px-10 md:pb-24 md:pt-[clamp(7rem,15vh,11rem)] motion-reduce:h-auto motion-reduce:overflow-visible motion-reduce:py-20"
    >
      {/* Topo: título + contador */}
      <div className="flex items-start justify-between gap-6">
        <h2 className="text-[clamp(1.6rem,min(4.2vw,6.5vh),3.5rem)] leading-[1.05] tracking-tight">
          <span className="block font-bold">O que a gente constrói</span>
          <span className="block font-light text-[var(--muted)]">
            sob medida para o seu negócio.
          </span>
        </h2>

        <span className="pt-2 text-sm font-medium tabular-nums motion-reduce:hidden">
          <span className="counter">01</span>
          <span className="text-[var(--muted)]"> / {pad(SERVICES.length)}</span>
        </span>
      </div>

      {/* Lista: a linha ativa vira um bloco preto com a imagem inclinada */}
      <ul className="mt-6 flex min-h-0 flex-1 flex-col justify-center md:mt-8">
        {SERVICES.map((s, i) => (
          <li
            key={s.title}
            data-active="false"
            className="row group relative rounded-[24px] px-4 py-3 text-black transition-colors duration-500 after:absolute after:inset-x-4 after:bottom-0 after:h-[2px] after:bg-black/15 after:transition-opacity after:duration-300 data-[active=true]:bg-[var(--ink)] data-[active=true]:text-white data-[active=true]:after:opacity-0 md:rounded-[32px] md:px-8 md:py-[clamp(0.6rem,1.8vh,1.4rem)] md:after:inset-x-8"
          >
            <div className="flex items-center gap-4 md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_auto] md:gap-8">
              {/* número + título */}
              <div className="flex flex-1 items-center gap-3 md:gap-6">
                <span className="w-6 shrink-0 text-xs font-medium tabular-nums opacity-50 md:w-8 md:text-sm">
                  {pad(i + 1)}
                </span>
                <h3 className="text-[clamp(1.15rem,min(3.1vw,4.8vh),2.75rem)] font-bold leading-[1.05] tracking-tight opacity-35 transition-opacity duration-300 group-data-[active=true]:opacity-100">
                  {s.title}
                </h3>
              </div>

              {/* descrição (desktop) */}
              <p className="hidden max-w-sm text-sm font-light text-[var(--muted)] transition-colors duration-300 group-data-[active=true]:text-white/70 md:block">
                {s.text}
              </p>

              {/* imagem inclinada + seta */}
              <div className="flex items-center gap-4 md:gap-6">
                <div aria-hidden className="relative hidden w-44 self-stretch md:block">
                  <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                    <div className="scale-75 rotate-0 opacity-0 transition-all duration-500 ease-out group-data-[active=true]:rotate-6 group-data-[active=true]:scale-100 group-data-[active=true]:opacity-100">
                      <Media
                        s={s}
                        i={i}
                        className="h-[clamp(6rem,15vh,9rem)] w-40 rounded-2xl border-2 border-white/80 shadow-xl"
                      />
                    </div>
                  </div>
                </div>

                <a
                  href="#contato"
                  aria-label={`Falar sobre ${s.title}`}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-black transition-colors duration-300 group-data-[active=true]:border-white group-data-[active=true]:bg-white group-data-[active=true]:text-black md:size-12"
                >
                  <ArrowUpRight strokeWidth={1.8} className="size-4 md:size-5" />
                </a>
              </div>
            </div>

            {/* mobile: descrição + imagem abrem embaixo */}
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-data-[active=true]:grid-rows-[1fr] md:hidden motion-reduce:grid-rows-[1fr]">
              <div className="min-h-0 overflow-hidden">
                <div className="flex flex-col gap-3 pb-1 pl-9 pt-3">
                  <p className="text-sm font-light text-white/70">{s.text}</p>
                  <Media s={s} i={i} className="h-24 w-full rounded-2xl" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Linha de progresso (igual à do Process) */}
      <div
        aria-hidden
        className="absolute inset-x-6 bottom-8 h-[3px] bg-black/15 md:inset-x-10 md:bottom-10 motion-reduce:hidden"
      >
        <span className="fill block h-full origin-left scale-x-0 bg-black" />
      </div>
    </section>
  );
}
