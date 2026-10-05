"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

const RATE = 0.15;
const PROJECTS = [5000, 30000, 100000]; // valores de exemplo
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export default function CommissionTable() {
  const [active, setActive] = useState(PROJECTS.length - 1);

  return (
    <div>
      <div className="mb-4 grid grid-cols-[1fr_auto_1fr] px-6 text-sm font-medium text-[var(--muted)] md:px-10">
        <span>Projeto fechado</span>
        <span className="w-12" aria-hidden />
        <span className="text-right">Sua comissão</span>
      </div>

      <ul className="flex flex-col gap-3">
        {PROJECTS.map((value, i) => {
          const on = active === i;
          return (
            <li key={value}>
              <button
                type="button"
                aria-pressed={on}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`grid w-full grid-cols-[1fr_auto_1fr] items-center rounded-2xl border px-6 py-6 text-left transition-colors duration-300 md:px-10 md:py-8 ${
                  on ? "border-black bg-black text-white" : "border-black/10"
                }`}
              >
                <span className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-semibold tracking-tight">{brl(value)}</span>
                <span className={`grid h-12 w-12 place-items-center rounded-full transition-colors duration-300 ${on ? "bg-white text-black" : "bg-black/5 text-black/50"}`}>
                  <ArrowRight size={18} strokeWidth={2} />
                </span>
                <span className="text-right text-[clamp(1.5rem,3.5vw,2.5rem)] font-semibold tracking-tight">{brl(value * RATE)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-sm font-light text-[var(--muted)]">Exemplos. A comissão real é 15% do valor fechado.</p>
    </div>
  );
}
