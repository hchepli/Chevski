"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FIDGETS, FIDGET_HOLD, type Mood } from "./engine";

type Ctx = {
  mood: Mood;
  message: string | null;
  /** muda o estado e mantém até você mudar de novo */
  setMood: (m: Mood, message?: string | null) => void;
  /** muda o estado por um tempo e volta para "idle" */
  flash: (m: Mood, opts?: { ms?: number; message?: string | null }) => void;
};

export const MascotContext = createContext<Ctx | null>(null);

export function useMascot() {
  const c = useContext(MascotContext);
  if (!c) throw new Error("useMascot precisa estar dentro de <MascotProvider>");
  return c;
}

type ProviderProps = {
  children: React.ReactNode;
  /** sem atividade por este tempo, ele começa a ficar inquieto (wink, ovo, hexágono, cometa...) */
  fidgetAfterMs?: number;
  /** sem atividade por este tempo, ele dorme */
  sleepAfterMs?: number;
};

export function MascotProvider({ children, fidgetAfterMs = 6000, sleepAfterMs = 30000 }: ProviderProps) {
  const [mood, setMoodState] = useState<Mood>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const moodRef = useRef<Mood>("idle");

  // única porta de entrada para mudar o estado (mantém o ref sempre em dia)
  const apply = useCallback((m: Mood) => {
    moodRef.current = m;
    setMoodState(m);
  }, []);

  const setMood = useCallback(
    (m: Mood, msg: string | null = null) => {
      clearTimeout(timer.current);
      apply(m);
      setMessage(msg);
    },
    [apply]
  );

  const flash = useCallback(
    (m: Mood, { ms = 2400, message: msg = null }: { ms?: number; message?: string | null } = {}) => {
      clearTimeout(timer.current);
      apply(m);
      setMessage(msg);
      timer.current = setTimeout(() => {
        apply("idle");
        setMessage(null);
      }, ms);
    },
    [apply]
  );

  useEffect(() => {
    let last = Date.now(); // última atividade do usuário
    let nextAt = 0; // quando troca a próxima animação inquieta
    let lastFidget: Mood | null = null;

    const isFidget = (m: Mood) => FIDGETS.includes(m);

    // qualquer atividade: acorda, acalma e zera os contadores
    const activity = () => {
      last = Date.now();
      nextAt = 0;
      const m = moodRef.current;
      if (m === "sleep") flash("surprised", { ms: 900 });
      else if (isFidget(m)) apply("idle");
    };

    const events = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, activity, { passive: true }));

    const pickFidget = (): Mood => {
      const pool = FIDGETS.filter((m) => m !== lastFidget);
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const iv = setInterval(() => {
      const m = moodRef.current;
      // só mexe se estiver livre: nunca atrapalha erro, sucesso, loading, formulário...
      if (m !== "idle" && !isFidget(m)) return;

      const now = Date.now();
      const idleFor = now - last;

      if (idleFor > sleepAfterMs) {
        setMood("sleep");
        return;
      }
      if (idleFor < fidgetAfterMs) {
        if (isFidget(m)) apply("idle");
        return;
      }
      if (now < nextAt) return;

      if (isFidget(m)) {
        // terminou uma animação: respira um instante em idle
        apply("idle");
        nextAt = now + 700 + Math.random() * 600;
      } else {
        const next = pickFidget();
        lastFidget = next;
        apply(next);
        nextAt = now + (FIDGET_HOLD[next] ?? 1500);
      }
    }, 200);

    return () => {
      events.forEach((e) => window.removeEventListener(e, activity));
      clearInterval(iv);
      clearTimeout(timer.current);
    };
  }, [apply, flash, setMood, fidgetAfterMs, sleepAfterMs]);

  const value = useMemo(() => ({ mood, message, setMood, flash }), [mood, message, setMood, flash]);
  return <MascotContext.Provider value={value}>{children}</MascotContext.Provider>;
}
