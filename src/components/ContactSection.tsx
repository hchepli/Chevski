"use client";
import { useRef, useState } from "react";
import { Mascot, MascotBubble, useMascot } from "./mascot";
import { ArrowUpRight } from "lucide-react";

type Field = "name" | "email" | "message";
const FIELDS: Field[] = ["name", "email", "message"];
const LABELS: Record<Field, string> = { name: "Nome", email: "E-mail", message: "Sobre o projeto" };
const RULES: Record<Field, (v: string) => string | null> = {
  name: (v) => (v.trim().length >= 2 ? null : "Como posso te chamar?"),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : "Esse e-mail parece incompleto."),
  message: (v) => (v.trim().length >= 10 ? null : "Conta um pouco mais sobre o projeto."),
};
const OK: Record<Field, string> = { name: "Prazer!", email: "E-mail anotado.", message: "Entendi." };

// TROQUE por um fetch("/api/contato") de verdade.
// Para testar o estado "triste", escreva "falha" na mensagem.
async function enviar(data: Record<Field, string>) {
  await new Promise((r) => setTimeout(r, 1500));
  if (data.message.toLowerCase().includes("falha")) throw new Error("demo");
}

const INPUT =
  "w-full rounded-2xl border border-black/15 bg-white/60 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30 aria-[invalid=true]:border-[#b42318]";

export default function ContactSection() {
  const { flash, setMood } = useMascot();
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sending, setSending] = useState(false);
  const [look, setLook] = useState<{ x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const refs = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  // o mascote olha na direção do campo em foco
  const aim = (el: Element) => {
    const b = box.current?.getBoundingClientRect();
    if (!b) return;
    const r = el.getBoundingClientRect();
    const dx = r.left + r.width / 2 - (b.left + b.width / 2);
    const dy = r.top + r.height / 2 - (b.top + b.height / 2);
    const len = Math.hypot(dx, dy) || 1;
    setLook({ x: dx / len, y: (dy / len) * 0.8 });
  };

  const onChange = (f: Field, v: string) => {
    setValues((s) => ({ ...s, [f]: v }));
    if (errors[f] && !RULES[f](v)) setErrors((e) => ({ ...e, [f]: undefined }));
  };

  const onBlur = (f: Field) => {
    setLook(null);
    const v = values[f];
    if (!v || sending) return;
    const err = RULES[f](v);
    setErrors((e) => ({ ...e, [f]: err ?? undefined }));
    if (err) flash("error", { message: err });
    else flash("happy", { ms: 1300, message: OK[f] });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const errs: Partial<Record<Field, string>> = {};
    FIELDS.forEach((f) => {
      const r = RULES[f](values[f]);
      if (r) errs[f] = r;
    });
    setErrors(errs);
    const first = FIELDS.find((f) => errs[f]);
    if (first) {
      flash("error", { ms: 2800, message: errs[first] });
      refs.current[first]?.focus();
      return;
    }
    setSending(true);
    setMood("loading", "Enviando…");
    try {
      await enviar(values);
      setValues({ name: "", email: "", message: "" });
      flash("success", { ms: 4000, message: "Recebi! Em breve falamos com você." });
    } catch {
      flash("sad", { ms: 4500, message: "Não consegui enviar. Tenta de novo?" });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contato" className="relative mx-auto grid min-h-screen max-w-5xl items-center gap-10 px-6 py-24 md:grid-cols-[300px_1fr] md:px-10">
      <div ref={box} className="flex flex-col items-center">
        <div className="flex h-12 items-end">
          <MascotBubble />
        </div>
        <Mascot size={260} look={look} />
      </div>

      <div>
        <h2 className="mb-8 text-2xl leading-tight md:text-[28px]">
          <span className="block font-bold">Conta pra gente o que você precisa</span>
          <span className="block font-light text-[var(--muted)]">e a gente entra em contato.</span>
        </h2>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          {FIELDS.map((f) => {
            const common = {
              id: f,
              name: f,
              value: values[f],
              className: INPUT,
              "aria-invalid": !!errors[f],
              "aria-describedby": errors[f] ? `${f}-erro` : undefined,
              onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(f, e.target.value),
              onFocus: (e: React.FocusEvent) => aim(e.currentTarget),
              onBlur: () => onBlur(f),
              ref: (el: HTMLInputElement | HTMLTextAreaElement | null) => {
                refs.current[f] = el;
              },
            };
            return (
              <div key={f}>
                <label htmlFor={f} className="mb-1.5 block text-xs font-medium">
                  {LABELS[f]}
                </label>
                {f === "message" ? (
                  <textarea rows={4} {...common} />
                ) : (
                  <input type={f === "email" ? "email" : "text"} autoComplete={f === "email" ? "email" : "name"} {...common} />
                )}
                {errors[f] && (
                  <p id={`${f}-erro`} role="alert" className="mt-1.5 text-xs text-[#b42318]">
                    {errors[f]}
                  </p>
                )}
              </div>
            );
          })}

<button
  type="submit"
  disabled={sending}
  className="group relative mt-2 flex w-full items-center justify-between overflow-hidden rounded-full border-2 border-black bg-black py-2 pl-7 pr-2 text-sm font-medium text-white disabled:opacity-60 md:w-fit md:justify-start"
>
  <span className="whitespace-nowrap">
    {sending ? "ENVIANDO…" : "ENVIAR"}
  </span>

  {/* Espaço reservado para o círculo */}
  <span className="h-11 w-11 shrink-0 md:ml-6" aria-hidden />

  <span className="absolute bottom-2 right-2 top-2 grid w-11 place-items-center rounded-full bg-white text-black transition-all duration-500 ease-in-out group-hover:w-[calc(100%-1rem)] group-disabled:w-11">
    <ArrowUpRight size={18} strokeWidth={2} />
  </span>
</button>
        </form>
      </div>
    </section>
  );
}
