import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import CasesList from "./CasesList";
import FloatingMascot from "@/components/FloatingMascot"; // ajuste o caminho

export const metadata: Metadata = {
  title: "Cases | Chevski",
  description: "Projetos que a Chevski entregou: sites institucionais e sistemas sob medida.",
};

const STATS = ["+10 projetos entregues", "Resposta em 1 dia útil", "Do UX ao deploy"];

// Mesmas laterais da Hero: px-6 md:px-10, sem max-width
const SIDES = "px-6 md:px-10";

export default function CasesPage() {
  // Sem bg-* aqui: herda o fundo do body, o mesmo do restante do site
  return (
    <main className="min-h-screen pb-28 pt-28 md:pt-32">
      <FloatingMascot />
      <div className={`w-full ${SIDES}`}>
        <header>
          <h1
            data-hero
            data-mascot-anchor
            className="mb-6 max-w-[14ch] text-[clamp(2.5rem,7vw,6rem)] font-bold leading-[1.02] tracking-tight"
          >
            Projetos que já estão no ar, funcionando.
          </h1>
          <p data-hero className="mb-16 max-w-[52ch] text-lg font-light leading-relaxed text-[var(--muted)]">
            Sites e sistemas que desenvolvemos para empresas e instituições de Santa Catarina e de todo o Brasil.
          </p>
        </header>

        <CasesList />
      </div>

      <section className={`mt-40 flex w-full flex-col items-center text-center ${SIDES}`}>
        <p className="mb-8 text-xs font-medium tracking-[0.25em] text-[var(--muted)]">VAMOS CRIAR</p>

        <h2 className="text-[clamp(2.75rem,8vw,7rem)] font-bold leading-[1.02] tracking-tighter">
          Seu projeto
          <br />
          <span className="font-light italic text-[var(--muted)]">pode ser </span>
          o próximo.
        </h2>

        <p className="mt-8 max-w-[34ch] text-lg font-light leading-relaxed text-[var(--muted)]">
          Conta o que você precisa. Em até 1 dia útil a gente responde.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {/* Mesmo botão da Hero */}
          <a
            href="/#contato"
            className="group relative flex w-fit items-center overflow-hidden rounded-full border-2 border-black bg-black py-2 pl-7 pr-2 text-sm font-medium text-white"
          >
            <span className="whitespace-nowrap">COMEÇAR PROJETO</span>
            <span className="ml-6 h-11 w-11 shrink-0" aria-hidden />
            <span className="absolute bottom-2 right-2 top-2 grid w-11 place-items-center rounded-full bg-white text-black transition-all duration-500 ease-in-out group-hover:w-[calc(100%-1rem)]">
              <ArrowUpRight size={18} strokeWidth={2} />
            </span>
          </a>
          <a
            href="https://wa.me/5500000000000"
            className="flex items-center rounded-full border-2 border-black/15 px-7 py-[18px] text-sm font-medium transition-colors hover:border-black"
          >
            FALAR NO WHATSAPP
          </a>
        </div>

        <ul className="mt-20 grid w-full max-w-3xl grid-cols-1 border-t border-black/10 pt-8 text-sm font-medium sm:grid-cols-3 sm:divide-x sm:divide-black/10">
          {STATS.map((s) => (
            <li key={s} className="py-2">{s}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
