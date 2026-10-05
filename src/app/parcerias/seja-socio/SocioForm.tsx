"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { useMascot } from "@/components/mascot"; // ajuste o caminho

const STAGES = ["Só a ideia", "Validando com clientes", "Tenho protótipo", "Já estou faturando"];
const REVENUES = ["Assinatura / mensalidade", "Venda de produto ou serviço", "Comissão / marketplace", "Anúncios", "Ainda não sei"];
const MARKETING = ["Ainda sem verba", "Até R$ 1 mil", "R$ 1 mil a R$ 5 mil", "R$ 5 mil a R$ 20 mil", "Acima de R$ 20 mil"];
const CODES = [
  { c: "BR", d: "+55" }, { c: "PT", d: "+351" }, { c: "US", d: "+1" },
  { c: "AR", d: "+54" }, { c: "PY", d: "+595" }, { c: "UY", d: "+598" },
];
const MAX = 900;

type Values = {
  name: string; instagram: string; phoneCode: string; phone: string; company: string;
  stage: string; revenue: string; marketing: string; sales: string; idea: string;
  consent: boolean; website: string;
};
const EMPTY: Values = {
  name: "", instagram: "", phoneCode: "+55", phone: "", company: "",
  stage: "", revenue: "", marketing: "", sales: "", idea: "",
  consent: false, website: "",
};

const digits = (s: string) => s.replace(/\D/g, "");
const maskBR = (v: string) => {
  const d = digits(v).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
const phoneOk = (code: string, v: string) => {
  const n = digits(v).length;
  return code === "+55" ? n === 10 || n === 11 : n >= 6;
};
const handleOk = (v: string) => v.replace(/^@/, "").trim().length >= 2;
const joinList = (a: string[]) => (a.length <= 1 ? a[0] ?? "" : `${a.slice(0, -1).join(", ")} e ${a[a.length - 1]}`);

const inp = (bad?: boolean) =>
  `w-full rounded-xl border bg-black/[0.03] px-4 py-3.5 text-[15px] font-normal outline-none transition-colors placeholder:text-black/35 focus:border-black ${
    bad ? "border-red-500" : "border-black/10"
  }`;

function Field({ id, label, optional, error, children }: { id: string; label: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && <span className="ml-1.5 font-normal text-black/45">opcional</span>}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function Select({ id, value, onChange, bad, children }: { id: string; value: string; onChange: (v: string) => void; bad?: boolean; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={bad} className={`${inp(bad)} appearance-none pr-10 ${value ? "" : "text-black/35"}`}>
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/50" />
    </div>
  );
}

function Phone({ id, label, code, value, error, onCode, onValue }: { id: string; label: string; code: string; value: string; error?: string; onCode: (v: string) => void; onValue: (v: string) => void }) {
  return (
    <Field id={id} label={label} error={error}>
      <div className="flex gap-3">
        <div className="relative w-[116px] shrink-0">
          <select aria-label="Código do país" value={code} onChange={(e) => onCode(e.target.value)} className={`${inp()} appearance-none pr-8`}>
            {CODES.map((c) => <option key={c.c} value={c.d}>{c.c} {c.d}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/50" />
        </div>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={value}
          aria-invalid={!!error}
          onChange={(e) => onValue(code === "+55" ? maskBR(e.target.value) : e.target.value.replace(/[^\d ()-]/g, ""))}
          placeholder={code === "+55" ? "(00) 00000-0000" : "Número com DDD"}
          className={inp(!!error)}
        />
      </div>
    </Field>
  );
}

export default function SocioForm() {
  const { setMood, flash } = useMascot();
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    setV((p) => ({ ...p, [k]: val }));
    if (errors[k]) setErrors((p) => { const n = { ...p }; delete n[k]; return n; });
  };

  const validate = () => {
    const out: { key: string; text: string; msg: string }[] = [];
    const add = (key: string, text: string, msg: string) => out.push({ key, text, msg });
    if (!v.name.trim()) add("name", "seu nome", "Preencha este campo");
    if (!handleOk(v.instagram)) add("instagram", "seu Instagram", "Preencha este campo");
    if (!digits(v.phone)) add("phone", "seu WhatsApp", "Preencha este campo");
    else if (!phoneOk(v.phoneCode, v.phone)) add("phone", "seu WhatsApp com DDD", "Número incompleto");
    if (!v.stage) add("stage", "o estágio da ideia", "Escolha uma opção");
    if (!v.revenue) add("revenue", "como o produto gera receita", "Escolha uma opção");
    if (!v.marketing) add("marketing", "o investimento em marketing", "Escolha uma opção");
    if (!v.sales.trim()) add("sales", "como você vai vender", "Preencha este campo");
    if (!v.idea.trim()) add("idea", "a explicação da ideia", "Preencha este campo");
    if (!v.consent) add("consent", "o aceite dos termos", "Confirme para continuar");
    return out;
  };

  // Mascote reage quando o campo perde o foco
  function onFormBlur(e: React.FocusEvent<HTMLFormElement>) {
    if (status === "sending") return;
    const id = (e.target as HTMLElement).id;
    switch (id) {
      case "f-name":
        if (v.name.trim()) flash("happy", { ms: 1300, message: "Prazer!" });
        break;
      case "f-instagram":
        if (!v.instagram.trim()) break;
        if (handleOk(v.instagram)) flash("happy", { ms: 1300, message: "Instagram anotado." });
        else flash("error", { ms: 2800, message: "Esse @ parece incompleto." });
        break;
      case "f-phone":
        if (!digits(v.phone)) break;
        if (phoneOk(v.phoneCode, v.phone)) flash("happy", { ms: 1300, message: "WhatsApp anotado." });
        else flash("error", { ms: 2800, message: "Esse número parece incompleto." });
        break;
      case "f-idea":
        if (v.idea.trim().length > 20) flash("happy", { ms: 1500, message: "Gostei da ideia!" });
        break;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;

    const found = validate();
    if (found.length) {
      setErrors(Object.fromEntries(found.map((f) => [f.key, f.msg])));
      const msg =
        found.length === 1 ? `Falta ${found[0].text}.`
        : found.length <= 3 ? `Faltam ${found.length} coisas: ${joinList(found.map((f) => f.text))}.`
        : `Faltam ${found.length} campos. Começa por ${found[0].text}.`;
      flash("error", { ms: 4500, message: msg });
      document.getElementById(`f-${found[0].key}`)?.focus();
      return;
    }

    setStatus("sending");
    setMood("loading", "Enviando…");
    try {
      const res = await fetch("/api/socio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não consegui enviar agora.");
      setStatus("done");
      flash("success", { ms: 4000, message: "Recebi! A gente já vai avaliar sua ideia." });
    } catch (err) {
      setStatus("idle");
      flash("sad", { ms: 4500, message: `${err instanceof Error ? err.message : "Não consegui enviar agora."} Tenta de novo?` });
    }
  }

  const reset = () => {
    setV(EMPTY);
    setErrors({});
    setStatus("idle");
    setMood("idle", null);
  };

  if (status === "done") {
    return (
      <div className="flex flex-col items-start gap-5 rounded-3xl border border-black/10 p-8 md:p-10" role="status">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-black text-white"><Check size={22} strokeWidth={2} /></span>
        <h3 className="text-2xl font-bold tracking-tight">Ideia enviada!</h3>
        <p className="font-light text-[var(--muted)]">A gente avalia e chama você no WhatsApp.</p>
        <button type="button" onClick={reset} className="text-sm font-medium underline underline-offset-4">Enviar outra ideia</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onBlur={onFormBlur} noValidate className="flex flex-col gap-10 rounded-3xl border border-black/10 p-6 md:p-10">
      {/* honeypot anti-robô */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={v.website} onChange={(e) => set("website", e.target.value)} />

      <div role="group" aria-labelledby="g-you" className="flex flex-col gap-5">
        <h3 id="g-you" className="border-b border-black/10 pb-3 text-xs font-medium tracking-[0.2em] text-[var(--muted)]">SOBRE VOCÊ</h3>

        <Field id="f-name" label="Seu nome" error={errors.name}>
          <input id="f-name" value={v.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={!!errors.name} className={inp(!!errors.name)} placeholder="Como você se chama" />
        </Field>
        <Field id="f-instagram" label="Seu Instagram" error={errors.instagram}>
          <input id="f-instagram" value={v.instagram} onChange={(e) => set("instagram", e.target.value)} autoCapitalize="none" aria-invalid={!!errors.instagram} className={inp(!!errors.instagram)} placeholder="@seuperfil" />
        </Field>
        <Phone id="f-phone" label="Seu WhatsApp" code={v.phoneCode} value={v.phone} error={errors.phone}
          onCode={(c) => setV((p) => ({ ...p, phoneCode: c, phone: "" }))} onValue={(x) => set("phone", x)} />
        <Field id="f-company" label="Empresa / projeto" optional>
          <input id="f-company" value={v.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" className={inp()} placeholder="Nome do negócio" />
        </Field>
      </div>

      <div role="group" aria-labelledby="g-idea" className="flex flex-col gap-5">
        <h3 id="g-idea" className="border-b border-black/10 pb-3 text-xs font-medium tracking-[0.2em] text-[var(--muted)]">SOBRE A IDEIA</h3>

        <Field id="f-stage" label="Em que estágio está a ideia" error={errors.stage}>
          <Select id="f-stage" value={v.stage} onChange={(x) => set("stage", x)} bad={!!errors.stage}>
            <option value="" disabled>Selecione</option>
            {STAGES.map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
        </Field>
        <Field id="f-revenue" label="Como o produto vai gerar receita" error={errors.revenue}>
          <Select id="f-revenue" value={v.revenue} onChange={(x) => set("revenue", x)} bad={!!errors.revenue}>
            <option value="" disabled>Selecione</option>
            {REVENUES.map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
        </Field>
        <Field id="f-marketing" label="Quanto pretende investir em marketing por mês" error={errors.marketing}>
          <Select id="f-marketing" value={v.marketing} onChange={(x) => set("marketing", x)} bad={!!errors.marketing}>
            <option value="" disabled>Selecione</option>
            {MARKETING.map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
        </Field>
        <Field id="f-sales" label="Como pretende vender e atrair clientes" error={errors.sales}>
          <textarea id="f-sales" rows={3} maxLength={MAX} value={v.sales} onChange={(e) => set("sales", e.target.value)} aria-invalid={!!errors.sales} className={`${inp(!!errors.sales)} resize-y`} placeholder="Canais, público, estratégia..." />
          <span className="text-right text-xs text-black/45">{v.sales.length}/{MAX}</span>
        </Field>
        <Field id="f-idea" label="Explique sua ideia" error={errors.idea}>
          <textarea id="f-idea" rows={5} maxLength={MAX} value={v.idea} onChange={(e) => set("idea", e.target.value)} aria-invalid={!!errors.idea} className={`${inp(!!errors.idea)} resize-y`} placeholder="O que é, para quem e qual problema resolve" />
          <span className="text-right text-xs text-black/45">{v.idea.length}/{MAX}</span>
        </Field>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex gap-3 text-sm font-light leading-snug text-[var(--muted)]">
          <input id="f-consent" type="checkbox" checked={v.consent} onChange={(e) => set("consent", e.target.checked)} aria-invalid={!!errors.consent} className="mt-0.5 h-4 w-4 shrink-0 accent-black" />
          <span>
            Li e aceito os{" "}
            <Link href="/termos" className="underline underline-offset-2">Termos de Uso</Link> e a{" "}
            <Link href="/privacidade" className="underline underline-offset-2">Política de Privacidade</Link>.
          </span>
        </label>
        {errors.consent && <p className="text-xs font-medium text-red-600">{errors.consent}</p>}
      </div>

      <button type="submit" disabled={status === "sending"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-60">
        {status === "sending" ? "Enviando..." : "Enviar minha ideia"}
        <ArrowUpRight size={16} strokeWidth={2} />
      </button>
    </form>
  );
}
