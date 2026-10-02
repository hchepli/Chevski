"use client";
import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Mascot, MascotBubble, useMascot } from "./mascot";
import { ArrowUpRight, Check, ChevronDown, Mail, MessageCircle } from "lucide-react";

gsap.registerPlugin(useGSAP);

// TROQUE pelos contatos reais
const WHATSAPP = "https://wa.me/5500000000000";
const EMAIL = "contato@seudominio.com";

type Field = "name" | "email" | "message";
type Perch = "top" | "bottom";

const FIELDS: Field[] = ["name", "email", "message"];
const LABELS: Record<Field, string> = { name: "Nome", email: "E-mail", message: "Sobre o projeto" };
const RULES: Record<Field, (v: string) => string | null> = {
  name: (v) => (v.trim().length >= 2 ? null : "Como posso te chamar?"),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : "Esse e-mail parece incompleto."),
  message: (v) => (v.trim().length >= 10 ? null : "Conta um pouco mais sobre o projeto."),
};
const OK: Record<Field, string> = { name: "Prazer!", email: "E-mail anotado.", message: "Entendi." };

// v = valor enviado | label = como aparece na frase
const TYPES = [
  { v: "Sistema web", label: "um sistema web" },
  { v: "App mobile", label: "um app mobile" },
  { v: "Dashboard / BI", label: "um dashboard / BI" },
  { v: "Integração / ERP", label: "uma integração / ERP" },
  { v: "Automação", label: "uma automação" },
  { v: "UX/UI Design", label: "um design UX/UI" },
  { v: "Outro", label: "outra coisa" },
];

const PASSOS = [
  { t: "Respondemos em até 1 dia útil", d: "Alguém do time lê a sua mensagem e retorna por e-mail ou WhatsApp." },
  { t: "Conversa de alinhamento", d: "Entendemos o problema, o prazo e o que é prioridade." },
  { t: "Proposta sob medida", d: "Você recebe escopo, prazo e valor antes de decidir qualquer coisa." },
];

// TROQUE por um fetch("/api/contato") de verdade.
// Para testar o estado "triste", escreva "falha" na mensagem.
async function enviar(data: Record<Field, string> & { type: string }) {
  await new Promise((r) => setTimeout(r, 1500));
  if (data.message.toLowerCase().includes("falha")) throw new Error("demo");
}

// campos da frase (linha embaixo, valor em negrito, placeholder leve)
const SENT =
  "w-full rounded-none border-0 border-b-2 border-black/25 bg-transparent px-1 pb-1 outline-none transition-colors focus:border-[var(--brand)] aria-[invalid=true]:border-[#b42318]";
const SENT_INPUT = `${SENT} font-bold text-black placeholder:font-light placeholder:text-[var(--muted)]`;
const ROW = "flex flex-wrap items-baseline gap-x-4 gap-y-2";

// campo de mensagem (label flutuante, precisa de placeholder=" ")
const AREA =
  "peer w-full resize-none rounded-none border-0 border-b-2 border-black/20 bg-transparent px-0 pb-2 pt-6 text-lg outline-none transition-colors focus:border-[var(--brand)] aria-[invalid=true]:border-[#b42318]";
const AREA_LABEL =
  "pointer-events-none absolute left-0 top-1 text-xs font-medium text-[var(--muted)] transition-all duration-200 peer-placeholder-shown:top-6 peer-placeholder-shown:text-lg peer-placeholder-shown:font-normal peer-focus:top-1 peer-focus:text-xs peer-focus:font-medium peer-focus:text-[var(--brand)]";

/* ───────── Dropdown próprio (combobox acessível) ─────────
   Teclado: ↑ ↓ Home End Enter Espaço Esc Tab. Foco fica no botão. */
type Opt = { v: string; label: string };

function Dropdown({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  onFocusEl,
  onBlurEl,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  placeholder: string;
  ariaLabel: string;
  onFocusEl: (el: Element) => void;
  onBlurEl: () => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const sel = options.findIndex((o) => o.v === value);

  // fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  // entrada da lista
  useEffect(() => {
    if (!open || !list.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.fromTo(
      list.current,
      { autoAlpha: 0, y: -8 },
      { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.2, ease: "power2.out" }
    );
  }, [open]);

  // mantém a opção destacada visível
  useEffect(() => {
    if (open) document.getElementById(`${id}-${hi}`)?.scrollIntoView({ block: "nearest" });
  }, [open, hi, id]);

  const openList = () => {
    setHi(sel >= 0 ? sel : 0);
    setOpen(true);
  };
  const pick = (i: number) => {
    onChange(options[i].v);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openList();
        else setHi((h) => Math.min(options.length - 1, h + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
        else setHi((h) => Math.max(0, h - 1));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setHi(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setHi(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) openList();
        else pick(hi);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={box} className="relative min-w-[12ch] flex-1">
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-${hi}` : undefined}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKey}
        onKeyUp={(e) => {
          if (e.key === " ") e.preventDefault(); // evita click duplo no Espaço
        }}
        onFocus={(e) => onFocusEl(e.currentTarget)}
        onBlur={onBlurEl}
        className={`${SENT} flex items-baseline justify-between gap-3 text-left ${
          sel >= 0 ? "font-bold text-black" : "font-light text-[var(--muted)]"
        }`}
      >
        <span className="truncate">{sel >= 0 ? options[sel].label : placeholder}</span>
        <ChevronDown
          aria-hidden
          size={24}
          strokeWidth={2}
          className={`relative top-1 shrink-0 text-black transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={ariaLabel}
          onMouseDown={(e) => e.preventDefault()} // mantém o foco no botão
          className="invisible absolute left-0 top-full z-30 mt-3 max-h-[min(22rem,50vh)] w-full min-w-[15rem] overflow-auto rounded-2xl border-2 border-black bg-white p-1.5 text-base font-normal shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
        >
          {options.map((o, i) => (
            <li
              key={o.v}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === sel}
              onMouseEnter={() => setHi(i)}
              onClick={() => pick(i)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-2.5 transition-colors ${
                i === sel ? "bg-black text-white" : i === hi ? "bg-black/5" : ""
              }`}
            >
              <span>{o.label}</span>
              {i === sel && <Check size={16} strokeWidth={3} aria-hidden />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ───────── Seção ───────── */
export default function ContactSection() {
  const { flash, setMood } = useMascot();
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", message: "" });
  const [type, setType] = useState("");
  const [terms, setTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ email: string; type: string } | null>(null);
  const [look, setLook] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState(176);

  const root = useRef<HTMLElement>(null);
  const wrap = useRef<HTMLDivElement>(null); // mascote (posição)
  const bob = useRef<HTMLDivElement>(null); // mascote (balanço)
  const title = useRef<HTMLHeadingElement>(null);
  const refs = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const fly = useRef<((p: Perch) => void) | null>(null);
  const cur = useRef<Perch>("top");
  const busy = useRef(false);

  /* ───────── Mascote sobrevoando ─────────
     Ele pousa em "poleiros" (.perch): espaços reservados no layout onde não
     existe conteúdo. No desktop ficam na coluna livre à direita; no mobile,
     ao lado do título e do botão. */
  useEffect(() => {
    const onResize = () => setSize(window.innerWidth < 768 ? 112 : 176);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const el = root.current;
    const m = wrap.current;
    const inner = bob.current;
    if (!el || !m || !inner) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const spot = (n: Perch) => {
      const p = (el.querySelector(`.perch[data-perch="${n}"]`) ??
        el.querySelector(".perch")) as HTMLElement | null;
      if (!p) return null;
      const rb = el.getBoundingClientRect();
      const pb = p.getBoundingClientRect();
      return {
        x: pb.left - rb.left + (pb.width - m.offsetWidth) / 2,
        y: pb.top - rb.top + (pb.height - m.offsetHeight) / 2,
        name: p.dataset.perch as Perch,
      };
    };

    const place = (n: Perch, animate: boolean) => {
      const s = spot(n);
      if (!s) return;
      cur.current = s.name;
      gsap.killTweensOf(m);
      if (!animate || reduce) {
        gsap.set(m, { x: s.x, y: s.y, autoAlpha: 1 });
        return;
      }
      const dx = s.x - (Number(gsap.getProperty(m, "x")) || 0);
      gsap.to(m, { x: s.x, duration: 1.5, ease: "power3.inOut" });
      gsap.to(m, { y: s.y, duration: 1.5, ease: "sine.inOut" });
      gsap.fromTo(
        inner,
        { rotation: 0 },
        { rotation: dx >= 0 ? 8 : -8, duration: 0.75, ease: "sine.inOut", yoyo: true, repeat: 1 }
      );
    };

    fly.current = (n) => place(n, true);
    place("top", false);
    const ro = new ResizeObserver(() => place(cur.current, false));
    ro.observe(el);

    if (!reduce) {
      gsap.to(inner, { y: -8, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }

    // de tempos em tempos ele troca de poleiro (se ninguém estiver digitando)
    let timer: gsap.core.Tween | undefined;
    const loop = () => {
      timer = gsap.delayedCall(gsap.utils.random(6, 10), () => {
        if (!busy.current && !document.hidden) place(cur.current === "top" ? "bottom" : "top", true);
        loop();
      });
    };
    if (!reduce) loop();

    return () => {
      timer?.kill();
      ro.disconnect();
      gsap.killTweensOf([m, inner]);
      fly.current = null;
    };
  }, [size]);

  // formulário ↔ confirmação mudam o layout: o mascote volta ao topo
  useEffect(() => {
    const id = requestAnimationFrame(() => fly.current?.("top"));
    return () => cancelAnimationFrame(id);
  }, [sent]);

  // o mascote vai para perto do campo e olha na direção dele
  const aim = (field: Element, perch: Perch) => {
    busy.current = true;
    fly.current?.(perch);
    const p = (root.current?.querySelector(`.perch[data-perch="${perch}"]`) ??
      root.current?.querySelector(".perch")) as HTMLElement | null;
    if (!p) return;
    const pr = p.getBoundingClientRect();
    const r = field.getBoundingClientRect();
    const dx = r.left + r.width / 2 - (pr.left + pr.width / 2);
    const dy = r.top + r.height / 2 - (pr.top + pr.height / 2);
    const len = Math.hypot(dx, dy) || 1;
    setLook({ x: dx / len, y: (dy / len) * 0.8 });
  };
  const rest = () => {
    busy.current = false;
    setLook(null);
  };

  /* ───────── Formulário ───────── */
  const onChange = (f: Field, v: string) => {
    setValues((s) => ({ ...s, [f]: v }));
    if (errors[f] && !RULES[f](v)) setErrors((e) => ({ ...e, [f]: undefined }));
  };

  const onBlur = (f: Field) => {
    rest();
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
    setTermsError(!terms);

    const first = FIELDS.find((f) => errs[f]);
    if (first) {
      flash("error", { ms: 2800, message: errs[first] });
      refs.current[first]?.focus();
      return;
    }
    if (!terms) {
      flash("error", { ms: 2800, message: "Falta aceitar os termos." });
      return;
    }

    setSending(true);
    busy.current = true;
    fly.current?.("bottom");
    setMood("loading", "Enviando…");
    try {
      await enviar({ ...values, type });
      setSent({ email: values.email.trim(), type });
      setValues({ name: "", email: "", message: "" });
      setType("");
      setTerms(false);
      flash("success", { ms: 4000, message: "Recebi! Em breve falamos com você." });
    } catch {
      flash("sad", { ms: 4500, message: "Não consegui enviar. Tenta de novo?" });
    } finally {
      setSending(false);
      busy.current = false;
    }
  };

  // confirmação: foco no título (leitores de tela) + passos animados
  useEffect(() => {
    if (sent) title.current?.focus({ preventScroll: true });
  }, [sent]);

  useGSAP(
    () => {
      if (!sent) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(".passo", { y: 20, opacity: 0, stagger: 0.12, duration: 0.5, ease: "power3.out", delay: 0.15 });
    },
    { scope: root, dependencies: [sent] }
  );

  /* ───────── Campos ───────── */
  // função que devolve JSX (e não componente) pra o input não remontar a cada tecla
  function renderField(f: Field) {
    const common = {
      id: f,
      name: f,
      value: values[f],
      "aria-invalid": !!errors[f],
      "aria-describedby": errors[f] ? `${f}-erro` : undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(f, e.target.value),
      onFocus: (e: React.FocusEvent) => aim(e.currentTarget, f === "message" ? "bottom" : "top"),
      onBlur: () => onBlur(f),
      ref: (el: HTMLInputElement | HTMLTextAreaElement | null) => {
        refs.current[f] = el;
      },
    };

    const error = errors[f] && (
      <p
        id={`${f}-erro`}
        role="alert"
        className={`text-xs text-[#b42318] ${f === "message" ? "mt-1.5" : "absolute left-1 top-full mt-1"}`}
      >
        {errors[f]}
      </p>
    );

    if (f === "message") {
      return (
        <div key={f}>
          <div className="relative">
            <textarea rows={3} placeholder=" " className={AREA} {...common} />
            <label htmlFor={f} className={AREA_LABEL}>
              {LABELS[f]}
            </label>
          </div>
          {error}
        </div>
      );
    }

    return (
      <div key={f} className="relative min-w-[12ch] flex-1">
        <input
          type={f === "email" ? "email" : "text"}
          autoComplete={f === "email" ? "email" : "name"}
          aria-label={LABELS[f]}
          placeholder={f === "name" ? "seu nome" : "seu e-mail"}
          className={SENT_INPUT}
          {...common}
        />
        {error}
      </div>
    );
  }

  return (
    <section ref={root} id="contato" className="relative mx-auto max-w-6xl px-6 py-28 md:px-10 md:py-32">
      {/* Mascote: sobrevoa a página, sem ocupar lugar no layout */}
      <div
        ref={wrap}
        className="pointer-events-none absolute left-0 top-0 z-20"
        style={{ width: size, height: size, visibility: "hidden" }}
      >
        <div className="absolute bottom-full right-0 mb-1 flex h-12 w-max max-w-[min(260px,70vw)] items-end justify-end">
          <MascotBubble />
        </div>
        <div ref={bob}>
          <Mascot size={size} look={look} />
        </div>
      </div>

      {/* Título + poleiro de cima */}
      <div className="flex items-start justify-between gap-6">
        <h2
          ref={title}
          tabIndex={sent ? -1 : undefined}
          className="text-xl leading-tight outline-none md:text-[43px]"
        >
          {sent ? (
            <>
              <span className="block font-bold">Recebemos o seu projeto!</span>
              <span className="block font-light text-[var(--muted)]">Agora é com a gente.</span>
            </>
          ) : (
            <>
              <span className="block font-bold">Conta pra gente o que você precisa</span>
              <span className="block font-light text-[var(--muted)]">e a gente entra em contato.</span>
            </>
          )}
        </h2>
        <span aria-hidden data-perch="top" className="perch h-28 w-28 shrink-0 md:h-44 md:w-44" />
      </div>

      {sent ? (
        /* ───── Confirmação ───── */
        <div role="status" className="mt-8 max-w-3xl md:mt-12">
          <ol className="flex flex-col gap-6">
            {PASSOS.map((p, i) => (
              <li key={p.t} className="passo flex items-start gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-black text-sm font-medium">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{p.t}</p>
                  <p className="text-sm font-light text-[var(--muted)]">{p.d}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-8 text-sm font-light text-[var(--muted)]">
            Vamos responder em <span className="font-medium text-black">{sent.email}</span>
            {sent.type && <> sobre {sent.type}</>}.
          </p>

          <button
            type="button"
            onClick={() => setSent(null)}
            className="mt-6 rounded-full border-2 border-black px-6 py-2.5 text-sm font-medium transition-colors hover:bg-black hover:text-white"
          >
            Enviar outro projeto
          </button>
        </div>
      ) : (
        /* ───── Formulário em forma de frase ─────
           Coluna do formulário limitada a max-w-3xl; à direita sobra a faixa
           livre onde o mascote pousa (desktop). */
        <form onSubmit={onSubmit} noValidate className="relative mt-8 md:mt-12">
          <div className="max-w-3xl">
            <div className="flex flex-col gap-7 text-[clamp(1.4rem,2.6vw,2.25rem)] leading-tight md:gap-9">
              <div className={ROW}>
                <span className="shrink-0 font-light">Oi, eu sou</span>
                {renderField("name")}
              </div>

              <div className={ROW}>
                <span className="shrink-0 font-light">e preciso de</span>
                <Dropdown
                  value={type}
                  onChange={setType}
                  options={TYPES}
                  placeholder="escolha uma opção"
                  ariaLabel="Tipo de projeto"
                  onFocusEl={(el) => aim(el, "top")}
                  onBlurEl={rest}
                />
              </div>

              <div className={ROW}>
                <span className="shrink-0 font-light">Pode me responder em</span>
                {renderField("email")}
              </div>
            </div>

            <div className="mt-10 md:mt-12">{renderField("message")}</div>

            {/* Termos + enviar. No mobile o poleiro fica ao lado; no desktop vai para a faixa da direita */}
            <div className="mt-8 flex items-end justify-between gap-4 md:mt-10">
              <div className="flex flex-col gap-5">
                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-sm font-light">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={terms}
                      aria-invalid={termsError}
                      onChange={(e) => {
                        setTerms(e.target.checked);
                        if (e.target.checked) setTermsError(false);
                      }}
                      onFocus={(e) => aim(e.currentTarget, "bottom")}
                      onBlur={rest}
                    />
                    <span
                      aria-hidden
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--brand)]/40 ${
                        termsError ? "border-[#b42318]" : "border-black"
                      } ${terms ? "bg-black text-white" : "bg-transparent"}`}
                    >
                      {terms && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span>
                      Li e aceito os{" "}
                      <a href="/termos" className="font-medium underline underline-offset-4">
                        Termos de Uso
                      </a>{" "}
                      e a{" "}
                      <a href="/privacidade" className="font-medium underline underline-offset-4">
                        Política de Privacidade
                      </a>
                      .
                    </span>
                  </label>
                  {termsError && (
                    <p role="alert" className="mt-1.5 text-xs text-[#b42318]">
                      Aceite os termos para enviar.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="group relative flex w-fit items-center overflow-hidden rounded-full border-2 border-black bg-black py-2 pl-7 pr-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  <span className="whitespace-nowrap">{sending ? "ENVIANDO…" : "ENVIAR"}</span>

                  {/* Espaço reservado para o círculo */}
                  <span className="ml-6 h-11 w-11 shrink-0" aria-hidden />

                  <span className="absolute bottom-2 right-2 top-2 grid w-11 place-items-center rounded-full bg-white text-black transition-all duration-500 ease-in-out group-hover:w-[calc(100%-1rem)] group-disabled:w-11">
                    <ArrowUpRight size={18} strokeWidth={2} />
                  </span>
                </button>
              </div>

              <span
                aria-hidden
                data-perch="bottom"
                className="perch h-28 w-28 shrink-0 md:absolute md:bottom-0 md:right-0 md:h-44 md:w-44"
              />
            </div>
          </div>
        </form>
      )}

      {/* Contatos diretos */}
      <div className="mt-14 grid gap-4 border-t border-black/10 pt-6 text-sm md:mt-20 md:grid-cols-3 md:items-center">
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-2 font-medium underline-offset-4 hover:underline"
        >
          <MessageCircle size={16} strokeWidth={2} />
          Chamar no WhatsApp
        </a>
        <a
          href={`mailto:${EMAIL}`}
          className="inline-flex w-fit items-center gap-2 font-medium underline-offset-4 hover:underline"
        >
          <Mail size={16} strokeWidth={2} />
          {EMAIL}
        </a>
        <p className="font-light text-[var(--muted)] md:text-right">Respondemos em até 1 dia útil.</p>
      </div>
    </section>
  );
}
