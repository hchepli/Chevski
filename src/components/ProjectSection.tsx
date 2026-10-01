"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";

gsap.registerPlugin(useGSAP, ScrollTrigger);
// no mobile, a barra de endereço muda a altura o tempo todo: não recalcular o pin
ScrollTrigger.config({ ignoreMobileResize: true });

type Projects = {
  cliente: string;
  nome: string;
  tipo: string;
  imagem?: string; // quando tiver a foto: "/projetos/erp.webp"
  cor: string; // gradiente de placeholder
};

// DADOS DE EXEMPLO: troque à vontade
const PROJETOS: Projects[] = [
  { cliente: "Empresa Um", nome: "Plataforma de Gestão", tipo: "Sistema web", cor: "from-[#3b2a8f] to-[#7b6cf0]" },
  { cliente: "Empresa Dois", nome: "App de Entregas", tipo: "Aplicativo mobile", cor: "from-[#0f766e] to-[#5eead4]" },
  { cliente: "Empresa Três", nome: "Painel Financeiro", tipo: "Dashboard / BI", cor: "from-[#9a3412] to-[#fdba74]" },
  { cliente: "Empresa Quatro", nome: "Portal do Cliente", tipo: "Portal + API", cor: "from-[#1e3a8a] to-[#93c5fd]" },
  { cliente: "Empresa Cinco", nome: "Automação de Estoque", tipo: "Integração / ERP", cor: "from-[#831843] to-[#f9a8d4]" },
];

const DURATION = 10; // "unidades" da timeline
const SCROLL_PER_UNIT = 40; // % da altura da tela por unidade

export default function ProjectSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const media = el.querySelector<HTMLElement>(".p-media")!;
      const list = el.querySelector<HTMLElement>(".p-list")!;
      const shots = gsap.utils.toArray<HTMLElement>(".p-shot", el);
      const slides = gsap.utils.toArray<HTMLElement>(".p-slide", el);
      const items = gsap.utils.toArray<HTMLElement>(".p-item", el);
      const fills = gsap.utils.toArray<HTMLElement>(".p-fill", el);
      const logos = gsap.utils.toArray<HTMLElement>(".p-logo", el);
      const N = shots.length;

      const pick = { t: 0 };

      // a imagem precisa nascer com a altura final: quem cresce é a máscara
      const measure = () =>
        media.style.setProperty("--media-h", media.clientHeight + "px");

      const applyPick = () => {
        // trilho linear (mobile): distribui de 8% a 92%
        const lin = 8 + pick.t * 84;

        // trilho do desktop: acompanha o centro de cada nome da lista
        let desk = lin;
        const listBox = list.getBoundingClientRect();
        if (listBox.height) {
          const stops = items.map((li) => {
            const b = li.getBoundingClientRect();
            return (b.top + b.height / 2 - listBox.top) / listBox.height;
          });
          desk = gsap.utils.clamp(
            0,
            100,
            gsap.utils.interpolate(stops, pick.t) * 100
          );
        }

        const val = (node: HTMLElement) =>
          node.closest("[data-linear]") ? lin : desk;

        fills.forEach((f) => (f.style.height = val(f) + "%"));
        logos.forEach((l) => (l.style.top = val(l) + "%"));

        const active = Math.round(pick.t * (N - 1));
        items.forEach((li, i) =>
          li.setAttribute("data-active", String(i === active))
        );
      };

      measure();
      gsap.set(shots[0], { height: "100%" });
      gsap.set(shots.slice(1), { height: "0%" });
      gsap.set(slides[0], { opacity: 1, y: 0 });
      gsap.set(slides.slice(1), { opacity: 0 });
      applyPick();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=" + DURATION * SCROLL_PER_UNIT + "%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onRefreshInit: () => {
            measure();
            applyPick();
          },
        },
      });

      // reserva a duração total (respiro no começo e no fim)
      tl.to({}, { duration: DURATION }, 0);

      const HOLD = DURATION * 0.1;
      const step = (DURATION - HOLD * 2) / (N - 1);
      const TRANS = step * 0.55;
      const SHIFT = 18;

      for (let k = 1; k < N; k++) {
        const at = HOLD + (k - 1) * step;

        // imagem nova desce por cima da anterior
        tl.fromTo(
          shots[k],
          { height: "0%" },
          { height: "100%", ease: "power2.inOut", duration: TRANS },
          at
        );

        // texto anterior sobe e some; o novo entra por baixo
        tl.to(
          slides[k - 1],
          { opacity: 0, y: -SHIFT, ease: "power1.in", duration: TRANS * 0.45 },
          at
        );
        tl.fromTo(
          slides[k],
          { opacity: 0, y: SHIFT },
          { opacity: 1, y: 0, ease: "power2.out", duration: TRANS * 0.6 },
          at + TRANS * 0.4
        );

        // barra preenche e a logo desce até o próximo item
        tl.to(
          pick,
          {
            t: k / (N - 1),
            ease: "power2.inOut",
            duration: TRANS,
            onUpdate: applyPick,
          },
          at
        );
      }
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="projetos"
      data-header-theme="dark"
      className="relative flex h-dvh flex-col gap-5 bg-[var(--ink)] px-6 pb-6 pt-24 text-white md:flex-row md:items-center md:gap-10 md:px-10 md:py-8"
    >
      {/* No mobile, este wrapper "some" (contents) e os filhos viram itens
          da section, reordenados com order-*. No desktop vira a coluna. */}
      <div className="contents md:flex md:w-[333px] md:shrink-0 md:flex-col md:gap-24">
        <p className="order-1 text-center text-3xl uppercase text-white/90 md:text-left md:text-2xl">
          Projetos
        </p>

        {/* nome + tipo (e indicador no mobile) */}
        <div className="order-3 flex items-end gap-4 md:block">
          <div className="relative h-[90px] flex-1 md:h-[130px] md:w-full">
            {PROJETOS.map((p) => (
              <div key={p.nome} className="p-slide absolute left-0 top-0 w-full">
                <h2 className="text-3xl font-normal leading-tight text-white/90 md:text-5xl">
                  {p.nome}
                </h2>
                <p className="mt-1 text-sm uppercase text-white/75 md:text-base">
                  {p.tipo}
                </p>
              </div>
            ))}
          </div>

          {/* indicador MOBILE (trilho com altura própria) */}
          <div
            data-linear
            className="relative h-[90px] w-5 shrink-0 md:hidden"
            aria-hidden
          >
            <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded bg-white/20" />
            <span className="p-fill absolute left-1/2 top-0 h-0 w-0.5 -translate-x-1/2 rounded bg-white/70" />
            <Logo className="p-logo absolute left-1/2 top-0 h-[26px] w-[22px] -translate-x-1/2 -translate-y-1/2 text-white" />
          </div>
        </div>

        {/* seletor DESKTOP */}
        <div className="order-4 hidden items-stretch gap-5 md:flex">
          <div className="relative w-5 shrink-0" aria-hidden>
            <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded bg-white/20" />
            <span className="p-fill absolute left-1/2 top-0 h-0 w-0.5 -translate-x-1/2 rounded bg-white/70" />
            <Logo className="p-logo absolute left-1/2 top-0 h-[26px] w-[22px] -translate-x-1/2 -translate-y-1/2 text-white" />
          </div>

          <ul className="p-list flex flex-col justify-center gap-5">
            {PROJETOS.map((p) => (
              <li
                key={p.cliente}
                data-active="false"
                className="p-item whitespace-nowrap text-sm uppercase text-white/50 transition-colors duration-200 data-[active=true]:text-white/80"
              >
                {p.cliente}
              </li>
            ))}
          </ul>
        </div>

        {/* botão MOBILE */}
        <a
          href="#contato"
          className="order-4 flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm uppercase text-black md:hidden"
        >
          Ver projeto
          <ArrowUpRight size={16} strokeWidth={1.8} />
        </a>
      </div>

      {/* ---------- Imagens ---------- */}
      <figure className="p-media relative order-2 min-h-0 w-full flex-1 overflow-hidden rounded-[24px] md:h-[76%] md:rounded-[40px]">
        {PROJETOS.map((p, i) => (
          <div
            key={p.nome}
            className="p-shot absolute left-0 top-0 w-full overflow-hidden"
            style={{ height: i === 0 ? "100%" : 0 }}
          >
            {/* altura fixa = altura final, para a imagem ser revelada e não esmagada */}
            <div
              className={`relative flex w-full items-end bg-gradient-to-br ${p.cor} p-6 md:p-10`}
              style={{ height: "var(--media-h, 100%)" }}
            >
              {/* QUANDO TIVER FOTO: troque por
                  <Image src={p.imagem} alt={p.nome} fill className="object-cover" /> */}
              <span className="text-6xl text-white/25 md:text-8xl">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          </div>
        ))}

        {/* borda interna */}
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-white/15" />
      </figure>
    </section>
  );
}