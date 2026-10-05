"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { useMascot } from "@/components/mascot"; // ajuste o caminho

const ROLES = ["Cliente da Chevski", "Parceiro ou profissional da área", "Amigo(a) do indicado", "Outro"];
const NEEDS = [
  "Sistema web sob medida", "App mobile", "Dashboards e BI", "Integrações e ERP",
  "Automações", "UX/UI Design", "Site institucional", "Ainda não sei",
];
const BUDGETS = ["Até R$ 5 mil", "R$ 5 mil a R$ 15 mil", "R$ 15 mil a R$ 50 mil", "Acima de R$ 50 mil", "Não sei informar"];
const CODES = [
  { c: "BR", d: "+55" }, { c: "PT", d: "+351" }, { c: "US", d: "+1" },
  { c: "AR", d: "+54" }, { c: "PY", d: "+595" }, { c: "UY", d: "+598" },
];
const MAX_DETAILS = 900;

type Values = {
  role: string; name: string; phoneCode: string; phone: string;
  clientName: string; clientPhoneCode: string; clientPhone: string;
  need: string; budget: string; details: string; consent: boolean; website: string;
};
const EMPTY: Values = {
  role: "", name: "", phoneCode: "+55", phone: "", clientName: "", clientPhoneCode: "+55", clientPhone: "",
  need: "", budget: "", details: "", consent: false, website: "",
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

export default function ReferralForm() {
  const { setMood, flash } = useMascot();
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    setV((p) => ({ ...p, [k]: val }));
    if (errors[k]) setErrors((p) => { const n = { ...p }; delete n[k]; return n; });
  };

  // devolve o que falta/está errado, na ordem do formulário
  const validate = () => {
    const out: { key: string; text: string; msg: string }[] = [];
    const add = (key: string, text: string, msg: string) => out.push({ key, text, msg });
    if (!v.role) add("role", "quem você é", "Escolha uma opção");
    if (!v.name.trim()) add("name", "seu nome", "Preencha este campo");
    if (!digits(v.phone)) add("phone", "seu WhatsApp", "Preencha este campo");
    else if (!phoneOk(v.phoneCode, v.phone)) add("phone", "seu WhatsApp com DDD", "Número incompleto");
    if (!v.clientName.trim()) add("clientName", "o nome do cliente", "Preencha este campo");
    if (!digits(v.clientPhone)) add("clientPhone", "o WhatsApp do cliente", "Preencha este campo");
    else if (!phoneOk(v.clientPhoneCode, v.clientPhone)) add("clientPhone", "o WhatsApp do cliente com DDD", "Número incompleto");
    if (!v.need) add("need", "do que o cliente precisa", "Escolha uma opção");
    if (!v.budget) add("budget", "a faixa de orçamento", "Escolha uma opção");
    if (!v.consent) add("consent", "a confirmação de que o cliente sabe da indicação", "Confirme para continuar");
    return out;
  };

  // Mascote reage quando o campo perde o foco (só fala, não mexe no layout)
  function onFormBlur(e: React.FocusEvent<HTMLFormElement>) {
    if (status === "sending") return;
    const id = (e.target as HTMLElement).id;
    switch (id) {
      case "f-name":
        if (v.name.trim()) flash("happy", { ms: 1300, message: "Prazer!" });
        break;
      case "f-phone":
        if (!digits(v.phone)) break;
        if (phoneOk(v.phoneCode, v.phone)) flash("happy", { ms: 1300, message: "WhatsApp anotado." });
        else flash("error", { ms: 2800, message: "Esse número parece incompleto." });
        break;
      case "f-clientName":
        if (v.clientName.trim()) flash("happy", { ms: 1300, message: "Anotado." });
        break;
      case "f-clientPhone":
        if (!digits(v.clientPhone)) break;
        if (phoneOk(v.clientPhoneCode, v.clientPhone)) flash("happy", { ms: 1300, message: "WhatsApp do cliente anotado." });
        else flash("error", { ms: 2800, message: "Esse número parece incompleto." });
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
      const res = await fetch("/api/indicacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não consegui enviar agora.");
      setStatus("done");
      // flash com tempo: o check some sozinho e o mascote volta ao normal
      flash("success", { ms: 4000, message: "Recebi! A gente já fala com o cliente." });
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
        <h3 className="text-2xl font-bold tracking-tight">Indicação enviada!</h3>
        <p className="font-light text-[var(--muted)]">A gente conversa com o indicado e te avisa pelo WhatsApp a cada etapa.</p>
        <button type="button" onClick={reset} className="text-sm font-medium underline underline-offset-4">Fazer outra indicação</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onBlur={onFormBlur} noValidate className="flex flex-col gap-10 rounded-3xl border border-black/10 p-6 md:p-10">
      {/* honeypot anti-robô */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={v.website} onChange={(e) => set("website", e.target.value)} />

      <div role="group" aria-labelledby="g-you" className="flex flex-col gap-5">
        <h3 id="g-you" className="border-b border-black/10 pb-3 text-xs font-medium tracking-[0.2em] text-[var(--muted)]">SOBRE VOCÊ (QUEM INDICA)</h3>

        <div role="radiogroup" aria-label="Você é" className="flex flex-col gap-3">
          <span className="text-sm font-medium">Você é</span>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r, i) => (
              <label key={r} className="cursor-pointer">
                <input id={i === 0 ? "f-role" : undefined} type="radio" name="role" value={r} checked={v.role === r} onChange={() => set("role", r)} className="peer sr-only" />
                <span className={`block rounded-full border px-4 py-2 text-sm transition-colors hover:border-black hover:text-black peer-checked:border-black peer-checked:bg-black peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-blue-500 ${errors.role ? "border-red-500 text-red-600" : "border-black/10 text-[var(--muted)]"}`}>{r}</span>
              </label>
            ))}
          </div>
          {errors.role && <p className="text-xs font-medium text-red-600">{errors.role}</p>}
        </div>

        <Field id="f-name" label="Seu nome" error={errors.name}>
          <input id="f-name" value={v.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={!!errors.name} className={inp(!!errors.name)} placeholder="Como você se chama" />
        </Field>
        <Phone id="f-phone" label="Seu WhatsApp" code={v.phoneCode} value={v.phone} error={errors.phone}
          onCode={(c) => setV((p) => ({ ...p, phoneCode: c, phone: "" }))} onValue={(x) => set("phone", x)} />
      </div>

      <div role="group" aria-labelledby="g-client" className="flex flex-col gap-5">
        <h3 id="g-client" className="border-b border-black/10 pb-3 text-xs font-medium tracking-[0.2em] text-[var(--muted)]">SOBRE O CLIENTE INDICADO</h3>

        <Field id="f-clientName" label="Nome do cliente / empresa" error={errors.clientName}>
          <input id="f-clientName" value={v.clientName} onChange={(e) => set("clientName", e.target.value)} aria-invalid={!!errors.clientName} className={inp(!!errors.clientName)} placeholder="Quem você está indicando" />
        </Field>
        <Phone id="f-clientPhone" label="WhatsApp do cliente" code={v.clientPhoneCode} value={v.clientPhone} error={errors.clientPhone}
          onCode={(c) => setV((p) => ({ ...p, clientPhoneCode: c, clientPhone: "" }))} onValue={(x) => set("clientPhone", x)} />
        <Field id="f-need" label="Do que o cliente precisa" error={errors.need}>
          <Select id="f-need" value={v.need} onChange={(x) => set("need", x)} bad={!!errors.need}>
            <option value="" disabled>Selecione</option>
            {NEEDS.map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
        </Field>
        <Field id="f-budget" label="Faixa de orçamento do cliente" error={errors.budget}>
          <Select id="f-budget" value={v.budget} onChange={(x) => set("budget", x)} bad={!!errors.budget}>
            <option value="" disabled>Selecione</option>
            {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
          </Select>
        </Field>
        <Field id="f-details" label="Detalhes da oportunidade" optional>
          <textarea id="f-details" rows={5} maxLength={MAX_DETAILS} value={v.details} onChange={(e) => set("details", e.target.value)} className={`${inp()} resize-y`} placeholder="Conte o que você sabe: o que o cliente quer, urgência..." />
          <span className="text-right text-xs text-black/45">{v.details.length}/{MAX_DETAILS}</span>
        </Field>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex gap-3 text-sm font-light leading-snug text-[var(--muted)]">
          <input id="f-consent" type="checkbox" checked={v.consent} onChange={(e) => set("consent", e.target.checked)} aria-invalid={!!errors.consent} className="mt-0.5 h-4 w-4 shrink-0 accent-black" />
          <span>
            O cliente sabe desta indicação e autorizou o contato. Li e aceito os{" "}
            <Link href="/termos" className="underline underline-offset-2">Termos de Uso</Link> e a{" "}
            <Link href="/privacidade" className="underline underline-offset-2">Política de Privacidade</Link>.
          </span>
        </label>
        {errors.consent && <p className="text-xs font-medium text-red-600">{errors.consent}</p>}
      </div>

      <button type="submit" disabled={status === "sending"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-60">
        {status === "sending" ? "Enviando..." : "Enviar indicação"}
        <ArrowUpRight size={16} strokeWidth={2} />
      </button>
    </form>
  );
}
