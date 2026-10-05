"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type Case = {
  name: string;
  type: "Site Institucional" | "Sistema Sob Medida";
  summary: string;
  tags: string[];
  color: string;   // cor da prévia (troque por `image` quando tiver prints)
  url?: string;    // link do projeto no ar
};

const CASES: Case[] = [
  { name: "CHP Smart", type: "Site Institucional", summary: "Presença digital clara e rápida para a empresa.", tags: ["Next.js", "GSAP"], color: "#1f6feb" },
  { name: "Paróquia Divino Espírito Santo", type: "Sistema Sob Medida", summary: "Sistema para organizar a rotina da paróquia.", tags: ["Django", "PostgreSQL"], color: "#8957e5" },
  { name: "Hidro Smart", type: "Site Institucional", summary: "Site que apresenta soluções e gera contatos.", tags: ["Next.js", "Tailwind"], color: "#0e9f8e" },
  { name: "Velp Mais", type: "Site Institucional", summary: "Institucional leve, pensado para o celular.", tags: ["React", "Figma"], color: "#d9480f" },
  { name: "Conceitto", type: "Sistema Sob Medida", summary: "Plataforma sob medida para a operação do cliente.", tags: ["Django", "Docker"], color: "#c2255c" },
];

const FILTERS = ["Todos", "Site Institucional", "Sistema Sob Medida"] as const;

export default function CasesList() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Todos");
  const [active, setActive] = useState<Case | null>(null);
  const [hasHover, setHasHover] = useState(true);
  const last = useRef<Case | null>(null);
  if (active) last.current = active;
  const shown = active ?? last.current;
  const root = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const moveX = useRef<(v: number) => void>();
  const moveY = useRef<(v: number) => void>();

  const list = CASES.filter((c) => filter === "Todos" || c.type === filter);

  // Entrada da página: uma única sequência
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-hero]", { yPercent: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.12 });
      gsap.from("[data-row]", { opacity: 0, y: 24, duration: 0.7, ease: "power3.out", stagger: 0.08, delay: 0.3 });
    }, root);
    return () => ctx.revert();
  }, []);

  // Detecta se o aparelho tem mouse (hover) ou é touch
  useEffect(() => {
    setHasHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  // Desktop: a prévia acompanha o cursor
  useEffect(() => {
    const el = preview.current;
    if (!el || !hasHover) return;
    const qx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const qy = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    const onMove = (e: MouseEvent) => {
      qx(e.clientX + 24);
      qy(e.clientY - 120);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [hasHover]);

  // Celular: a prévia fica fixa no canto e troca conforme o scroll
  useEffect(() => {
    const el = preview.current;
    if (!el || hasHover) return;

    const place = () =>
      gsap.set(el, {
        x: window.innerWidth - el.offsetWidth - 20,
        y: window.innerHeight - el.offsetHeight - 24,
      });
    place();
    window.addEventListener("resize", place);

    // Faixa fina no meio da tela: o item que cruza essa faixa fica ativo
    const rows = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-row]") ?? []);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const c = list[rows.indexOf(entry.target as HTMLElement)];
          if (!c) return;
          if (entry.isIntersecting) setActive(c);
          else setActive((prev) => (prev?.name === c.name ? null : prev));
        });
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );
    rows.forEach((r) => io.observe(r));

    return () => {
      io.disconnect();
      window.removeEventListener("resize", place);
      setActive(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHover, filter]);

  useEffect(() => {
    if (!preview.current) return;
    gsap.to(preview.current, { scale: active ? 1 : 0.85, opacity: active ? 1 : 0, duration: 0.3, ease: "power2.out" });
  }, [active]);

  return (
    <div ref={root}>
      <div className="-mx-6 mb-8 flex flex-nowrap gap-2 overflow-x-auto px-6 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Filtrar por tipo de projeto">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 ${filter === f ? "border-black bg-black text-white" : "border-black/10 text-[var(--muted)] hover:border-black hover:text-black"}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="border-t border-black/10">
        {list.map((c) => (
          <li key={c.name} data-row>
            <a
              href={c.url ?? "/#contato"}
              className={`grid items-baseline gap-2 border-b border-black/10 py-8 transition-[padding] duration-300 focus-visible:outline-2 focus-visible:outline-blue-500 motion-reduce:transition-none md:grid-cols-[2fr_1.2fr_2fr_1fr] md:gap-6 ${active?.name === c.name ? "pl-4" : ""}`}
              onMouseEnter={() => setActive(c)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(c)}
              onBlur={() => setActive(null)}
            >
              <span className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold tracking-tight">{c.name}</span>
              <span className="text-[0.95rem] leading-normal text-[var(--muted)]">{c.type}</span>
              <span className="text-[0.95rem] leading-normal text-[var(--muted)]">{c.summary}</span>
              <span className="text-[0.95rem] leading-normal text-[var(--muted)] md:text-right">{c.tags.join(", ")}</span>
            </a>
          </li>
        ))}
      </ul>

      <div
        ref={preview}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-20 flex h-[120px] w-[150px] scale-[0.85] items-end rounded-xl p-3 text-sm font-semibold text-white opacity-0 md:h-[220px] md:w-[280px] md:p-4 md:text-base"
        style={{ background: shown?.color ?? "transparent" }}
      >
        <span>{shown?.name}</span>
      </div>
    </div>
  );
}
