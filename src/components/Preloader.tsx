"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const WORD = "CHEVSKI".split("");
const GRAY = "#9a9a9a";

type PlWindow = Window & { __plReveal?: boolean };

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const finish = () => {
      document.body.style.overflow = "";
      (window as PlWindow).__plReveal = true;
      window.dispatchEvent(new Event("preloader:done"));
      setDone(true);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    document.body.style.overflow = "hidden";

    let cancelled = false;
    let ctx: gsap.Context | undefined;

    // destino do voo + itens do header que entram depois
    const headerLogo = document.getElementById("header-logo");
    const headerItems = Array.from(
      document.querySelectorAll<HTMLElement>(".nav > nav, .nav > div")
    );

    if (!headerLogo) {
      console.warn(
        '[Preloader] elemento #header-logo não encontrado. Coloque id="header-logo" no <svg> da logo do Navbar.'
      );
    }

    document.fonts.ready.then(() => {
      if (cancelled) return;

      ctx = gsap.context(() => {
        const letters = gsap.utils.toArray<HTMLElement>(".pl-letter");
        const inners = gsap.utils.toArray<HTMLElement>(".pl-inner");
        const widths = letters.map((el) => el.scrollWidth);

        gsap.set(letters, { width: 0 });
        gsap.set(inners, { yPercent: 100, opacity: 0, color: GRAY });
        if (headerLogo) gsap.set(headerLogo, { opacity: 0 });
        gsap.set(headerItems, { opacity: 0, y: -14 });

        const counter = { v: 0 };
        const render = () => {
          if (percentRef.current) {
            percentRef.current.textContent = Math.round(counter.v) + "%";
          }
        };
        const count = (to: number, duration: number, at: string | number) =>
          tl.to(counter, { v: to, duration, ease: "none", onUpdate: render }, at);

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            gsap.set(root, { display: "none" });
            finish();
          },
        });

        // Fase 0: logo sozinha (0%)
        tl.to({}, { duration: 0.5 });

        // Fase 1: letras entram (0 → 50%)
        tl.addLabel("enter");
        const STEP = 0.18;
        letters.forEach((el, i) => {
          const t = i * STEP;
          tl.to(el, { width: widths[i], duration: 0.45 }, `enter+=${t}`);
          tl.to(inners[i], { yPercent: 0, opacity: 1, duration: 0.45 }, `enter+=${t}`);
          tl.to(inners[i], { color: "#000", duration: 0.3, ease: "none" }, `enter+=${t + STEP + 0.1}`);
        });
        count(50, (letters.length - 1) * STEP + 0.55, "enter");

        // Segura o nome completo (50%)
        tl.to({}, { duration: 0.6 });

        // Fase 2: letras saem (50 → 87%)
        tl.addLabel("exit");
        const OUT = 0.1;
        letters.forEach((el, i) => {
          const t = i * OUT;
          tl.to(inners[i], { color: GRAY, duration: 0.15, ease: "none" }, `exit+=${t}`);
          tl.to(el, { width: 0, duration: 0.5, ease: "power3.inOut" }, `exit+=${t + 0.05}`);
          tl.to(inners[i], { opacity: 0, duration: 0.3, ease: "none" }, `exit+=${t + 0.2}`);
        });
        count(87, (letters.length - 1) * OUT + 0.55, "exit");

        // Logo sozinha (87%)
        tl.to({}, { duration: 0.3 });

        // Fase 3: impulso + voo até o header (87 → 100%)
        tl.addLabel("fly");
        const FLY = 1.1;
        const LIFT = 0.25;

        if (headerLogo && logoRef.current) {
          const logo = logoRef.current;

          // calcula o destino uma vez, quando o voo começa
          const target = { x: 0, y: 0, scale: 1 };
          tl.call(
            () => {
              const from = logo.getBoundingClientRect();
              const to = headerLogo.getBoundingClientRect();
              target.x = to.left + to.width / 2 - (from.left + from.width / 2);
              target.y = to.top + to.height / 2 - (from.top + from.height / 2);
              target.scale = to.height / from.height;
            },
            undefined,
            "fly"
          );

          // pequeno impulso antes de decolar
          tl.to(logo, { scale: 1.12, duration: LIFT, ease: "power2.out" }, "fly");
          tl.to(
            logo,
            {
              x: () => target.x,
              y: () => target.y,
              scale: () => target.scale,
              duration: FLY,
              ease: "expo.inOut",
              overwrite: "auto",
            },
            `fly+=${LIFT}`
          );
        }

        // contador linear durante todo o voo (87 → 100)
        count(100, FLY, `fly+=${LIFT}`);

        // ~90%: o site começa a aparecer (Hero escuta este evento)
        const REVEAL = LIFT + FLY * 0.25;
        tl.call(
          () => {
            (window as PlWindow).__plReveal = true;
            window.dispatchEvent(new Event("preloader:reveal"));
          },
          undefined,
          `fly+=${REVEAL}`
        );

        // o fundo branco clareia revelando o site
        tl.to(
          root,
          { backgroundColor: "rgba(255,255,255,0)", duration: 0.7, ease: "power1.inOut" },
          `fly+=${REVEAL}`
        );

        // a porcentagem some em ~95%, antes de chegar no 100
        tl.to(
          percentRef.current,
          { opacity: 0, duration: 0.25, ease: "none" },
          `fly+=${LIFT + FLY * 0.55}`
        );

        // header entra em cascata enquanto a logo pousa
        tl.to(
          headerItems,
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" },
          `fly+=${LIFT + FLY * 0.6}`
        );

        // crossfade sem corte: a logo do header aparece POR CIMA da que está
        // pousando e só depois a do preloader some
        tl.addLabel("land", `fly+=${LIFT + FLY}`);
        if (headerLogo && logoRef.current) {
          tl.to(
            headerLogo,
            { opacity: 1, duration: 0.2, ease: "none" },
            `fly+=${LIFT + FLY * 0.85}`
          );
          tl.set(logoRef.current, { opacity: 0 }, "land+=0.1");
        }

        // pequena folga antes de remover o preloader
        tl.to({}, { duration: 0.1 }, "land+=0.6");
      }, root);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
      document.body.style.overflow = "";
      if (headerLogo) headerLogo.style.opacity = "";
      headerItems.forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
      });
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
    >
      <div className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={logoRef} src="/logo.svg" alt="" className="h-16 w-auto will-change-transform" />
        <div className="font-display flex text-6xl leading-none text-black">
          {WORD.map((letter, i) => (
            <span key={i} className="pl-letter inline-block w-0 overflow-hidden whitespace-nowrap">
              <span
                className={`pl-inner inline-block pr-[0.1em] opacity-0 will-change-transform ${
                  i === 0 ? "pl-[14px]" : ""
                }`}
              >
                {letter}
              </span>
            </span>
          ))}
        </div>
      </div>

      <span
        ref={percentRef}
        className="absolute top-[calc(50%+76px)] left-1/2 -translate-x-1/2 font-sans text-[11px] font-medium tabular-nums text-black"
      >
        0%
      </span>
    </div>
  );
}