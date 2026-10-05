import type { Metadata } from "next";
import { ArrowDown } from "lucide-react";
import CommissionTable from "./CommissionTable";
import ReferralSection from "./ReferralSection";
import MascotShell from "./MascotShell";

export const metadata: Metadata = {
  title: "Indique e Ganhe | Chevski",
  description: "Indique a Chevski e receba 15% do valor total de cada projeto fechado.",
};

const SIDES = "px-6 md:px-10";
// espaço entre seções
const GAP = "mt-40 md:mt-56";

const STEPS = [
  { title: "Você indica", text: "Preencha o formulário." },
  { title: "A gente conversa", text: "Falamos com o indicado." },
  { title: "A gente fecha", text: "Definimos escopo, prazo e valor." },
  { title: "Você recebe 15%", text: "Sobre o valor total do projeto." },
];

export default function IndiqueEGanhePage() {
  return (
    <MascotShell>
      <main className="min-h-screen pb-40 pt-28 md:pt-32">
        {/* Hero: largura total */}
        <header className={`grid w-full gap-12 md:grid-cols-[1fr_auto] md:items-end md:gap-16 ${SIDES}`}>
          <div>
            <h1 className="mb-8 text-[clamp(2.75rem,8vw,7.5rem)] font-bold leading-[1.02] tracking-tight">
              <span data-mascot-anchor>Indique e receba pelo projeto fechado.</span>
            </h1>
            <p className="mb-12 max-w-[44ch] text-lg font-light leading-relaxed text-[var(--muted)]">
              Conhece alguém que precisa de site, sistema ou app? Se fecharmos, a comissão é sua.
            </p>
            <a
              href="#indicar"
              className="group relative flex w-fit items-center overflow-hidden rounded-full border-2 border-black bg-black py-2 pl-7 pr-2 text-sm font-medium text-white"
            >
              <span className="whitespace-nowrap">QUERO INDICAR</span>
              <span className="ml-6 h-11 w-11 shrink-0" aria-hidden />
              <span className="absolute bottom-2 right-2 top-2 grid w-11 place-items-center rounded-full bg-white text-black transition-all duration-500 ease-in-out group-hover:w-[calc(100%-1rem)]">
                <ArrowDown size={18} strokeWidth={2} />
              </span>
            </a>
          </div>

          <div className="md:text-right">
            <p className="text-[clamp(6rem,18vw,15rem)] font-bold leading-[0.85] tracking-tighter">15%</p>
            <p className="mt-4 font-light text-[var(--muted)]">de cada projeto fechado</p>
          </div>
        </header>

        {/* Comissões */}
        <section className={`${GAP} ${SIDES}`}>
          <h2 className="mb-14 max-w-[16ch] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.05] tracking-tight">
            Quanto maior o projeto, maior a comissão.
          </h2>
          <CommissionTable />
        </section>

        {/* Como funciona: horizontal no desktop, vertical no celular */}
        <section id="como-funciona" className={`${GAP} scroll-mt-28 ${SIDES}`}>
          <h2 className="mb-14 max-w-[12ch] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.05] tracking-tight md:mb-16">
            Como funciona
          </h2>

          <ol className="flex flex-col md:grid md:grid-cols-4">
            {STEPS.map((s, i) => {
              const last = i === STEPS.length - 1;
              return (
                <li key={s.title} className="relative flex gap-6 pb-10 last:pb-0 md:flex-col md:gap-6 md:pb-0 md:pr-8">
                  {/* linha vertical (celular) */}
                  {!last && <span aria-hidden className="absolute bottom-0 left-5 top-12 w-px bg-black/15 md:hidden" />}
                  {/* linha horizontal (desktop) */}
                  {!last && <span aria-hidden className="absolute left-14 right-4 top-5 hidden h-px bg-black/15 md:block" />}
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${last ? "bg-black text-white" : "border border-black/25"}`}>
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-1 font-light text-[var(--muted)]">{s.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Formulário */}
        <section id="indicar" className={`${GAP} scroll-mt-28 ${SIDES}`}>
          <ReferralSection />
        </section>
      </main>
    </MascotShell>
  );
}
