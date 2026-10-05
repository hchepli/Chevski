import type { Metadata } from "next";
import { ArrowDown } from "lucide-react";
import SocioSection from "./SocioSection";
import MascotShell from "./MascotShell";

export const metadata: Metadata = {
  title: "Seja Sócio | Chevski",
  description: "Você traz a ideia, a Chevski constrói a tecnologia sem custo de desenvolvimento e fica com 10% do faturamento.",
};

const SIDES = "px-6 md:px-10";
const GAP = "mt-40 md:mt-56";

const MODELO = [
  { title: "A gente constrói", text: "Site, app ou sistema. Do design ao código." },
  { title: "Você opera", text: "Servidor, domínio, ferramentas e o negócio." },
  { title: "10% do faturamento", text: "Só ganhamos se você ganhar." },
];

const NOS = ["Produto completo, do design ao código", "Evolução e manutenção", "Tecnologia sempre atualizada"];
const VOCE = ["Servidor e domínio", "Ferramentas e custos de estrutura", "Operação e crescimento do negócio"];

const STEPS = [
  { title: "Apresente a ideia", text: "Preencha o formulário." },
  { title: "Avaliamos juntos", text: "Potencial, escopo e expectativas." },
  { title: "Construímos e crescemos", text: "Você opera, a gente evolui a tecnologia." },
];

export default function SejaSocioPage() {
  return (
    <MascotShell>
      <main className="min-h-screen pb-40 pt-28 md:pt-32">
        {/* Hero */}
        <header className={`grid w-full gap-12 md:grid-cols-[1fr_auto] md:items-end md:gap-16 ${SIDES}`}>
          <div>
            <h1 className="mb-8 text-[clamp(2.75rem,7vw,6.5rem)] font-bold leading-[1.02] tracking-tight">
              <span data-mascot-anchor>Você tem a ideia. A gente constrói a tecnologia.</span>
            </h1>
            <p className="mb-12 max-w-[44ch] text-lg font-light leading-relaxed text-[var(--muted)]">
              Sem custo de desenvolvimento. Em troca, ficamos com 10% do faturamento.
            </p>
            <a
              href="#ideia"
              className="group relative flex w-fit items-center overflow-hidden rounded-full border-2 border-black bg-black py-2 pl-7 pr-2 text-sm font-medium text-white"
            >
              <span className="whitespace-nowrap">APRESENTAR MINHA IDEIA</span>
              <span className="ml-6 h-11 w-11 shrink-0" aria-hidden />
              <span className="absolute bottom-2 right-2 top-2 grid w-11 place-items-center rounded-full bg-white text-black transition-all duration-500 ease-in-out group-hover:w-[calc(100%-1rem)]">
                <ArrowDown size={18} strokeWidth={2} />
              </span>
            </a>
          </div>

          <div className="md:text-right">
            <p className="text-[clamp(5rem,14vw,12rem)] font-bold leading-[0.85] tracking-tighter">R$ 0</p>
            <p className="mt-4 font-light text-[var(--muted)]">de desenvolvimento</p>
          </div>
        </header>

        {/* O modelo */}
        <section id="modelo" className={`${GAP} scroll-mt-28 ${SIDES}`}>
          <h2 className="mb-14 max-w-[16ch] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.05] tracking-tight">
            Development for equity.
          </h2>
          <ul className="grid divide-y divide-black/10 border-t border-black/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {MODELO.map((m, i) => (
              <li key={m.title} className="py-8 md:px-8 md:py-10 md:first:pl-0 md:last:pr-0">
                <span className="text-sm text-[var(--muted)]">0{i + 1}</span>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">{m.title}</h3>
                <p className="mt-2 max-w-[28ch] font-light leading-relaxed text-[var(--muted)]">{m.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Quem faz o quê */}
        <section className={`${GAP} ${SIDES}`}>
          <h2 className="mb-14 max-w-[16ch] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.05] tracking-tight">
            Cada um cuida da sua parte.
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-black bg-black p-8 text-white md:p-10">
              <h3 className="mb-6 text-2xl font-semibold tracking-tight">Nossa equipe</h3>
              <ul className="flex flex-col gap-3 font-light">
                {NOS.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
            <div className="rounded-3xl border border-black/10 p-8 md:p-10">
              <h3 className="mb-6 text-2xl font-semibold tracking-tight">Você</h3>
              <ul className="flex flex-col gap-3 font-light text-[var(--muted)]">
                {VOCE.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          </div>
        </section>

        {/* Recompra */}
        <section className={`grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end md:gap-16 ${GAP} ${SIDES}`}>
          <h2 className="max-w-[16ch] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.05] tracking-tight">
            Os 10% podem ser recomprados.
          </h2>
          <p className="max-w-[40ch] font-light leading-relaxed text-[var(--muted)] md:justify-self-end">
            Quando fizer sentido, você traz a participação de volta e fica com a tecnologia e 100% do faturamento.
          </p>
        </section>

        {/* Como começa: horizontal no desktop, vertical no celular */}
        <section className={`${GAP} ${SIDES}`}>
          <h2 className="mb-14 max-w-[12ch] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.05] tracking-tight md:mb-16">
            Como começa
          </h2>
          <ol className="flex flex-col md:grid md:grid-cols-3">
            {STEPS.map((s, i) => {
              const last = i === STEPS.length - 1;
              return (
                <li key={s.title} className="relative flex gap-6 pb-10 last:pb-0 md:flex-col md:gap-6 md:pb-0 md:pr-8">
                  {!last && <span aria-hidden className="absolute bottom-0 left-5 top-12 w-px bg-black/15 md:hidden" />}
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
        <section id="ideia" className={`${GAP} scroll-mt-28 ${SIDES}`}>
          <SocioSection />
        </section>
      </main>
    </MascotShell>
  );
}
