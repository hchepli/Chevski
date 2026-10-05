"use client";
import { useEffect, useRef, useState } from "react";
import { Mascot, MascotBubble, MascotProvider, useMascot } from "@/components/mascot"; // ajuste o caminho

const SIZE_DESK = 160;
const SIZE_MOBILE = 110;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function Follower() {
  const { flash } = useMascot();
  const box = useRef<HTMLDivElement>(null);
  const [desk, setDesk] = useState(false);
  const [look, setLook] = useState<{ x: number; y: number } | null>(null);

  // desktop = tela larga com mouse. Senão, fica sobrevoando no canto.
  useEffect(() => {
    const mq = window.matchMedia("(min-width:1024px) and (hover:hover)");
    const update = () => setDesk(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!desk || !el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const mouse = { x: 0, y: 0, moved: false };
    const pos = { x: 0, y: 0, init: false };
    let greeted = false;
    let raf = 0;
    let perch = 0;
    let busy = false; // alguém digitando: não troca de poleiro
    let nextSwap = performance.now() + rand(6000, 10000);

    const dockEl = () => document.querySelector("[data-mascot-dock]") as HTMLElement | null;
    const perchEl = (i: number) => document.querySelector(`[data-mascot-perch="${i}"]`) as HTMLElement | null;
    const isDocked = () => {
      const d = dockEl()?.getBoundingClientRect();
      return !!d && d.top < window.innerHeight * 0.85 && d.bottom > 0;
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.moved = true;
    };

    // foco em um campo do formulário: vai pro poleiro e olha pra ele
    const onIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest?.("form") || !isDocked()) return;
      busy = true;
      const r = t.getBoundingClientRect();
      perch = r.top + r.height / 2 < window.innerHeight / 2 ? 0 : 1;
      const p = perchEl(perch)?.getBoundingClientRect();
      if (!p) return;
      const dx = r.left + r.width / 2 - (p.left + p.width / 2);
      const dy = r.top + r.height / 2 - (p.top + p.height / 2);
      const len = Math.hypot(dx, dy) || 1;
      setLook({ x: dx / len, y: (dy / len) * 0.8 });
    };
    const onOut = () => {
      busy = false;
      setLook(null);
      nextSwap = performance.now() + rand(6000, 10000);
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);

    const tick = () => {
      const now = performance.now();
      const anchor = document.querySelector("[data-mascot-anchor]")?.getBoundingClientRect();
      const docked = isDocked();
      const maxX = window.innerWidth - SIZE_DESK - 8;
      const maxY = window.innerHeight - SIZE_DESK - 8;

      let tx = mouse.x + 20;
      let ty = mouse.y + 20;
      let k = reduce ? 1 : 0.12;

      if (docked) {
        // formulário: para de seguir o mouse e passeia entre os poleiros
        if (!busy && now > nextSwap) {
          perch = perch ? 0 : 1;
          nextSwap = now + rand(6000, 10000);
        }
        const p = (perchEl(perch) ?? dockEl())?.getBoundingClientRect();
        if (p) {
          tx = p.left + (p.width - SIZE_DESK) / 2;
          ty = p.top + (p.height - SIZE_DESK) / 2;
        }
        k = reduce ? 1 : 0.07;
        if (!greeted) {
          greeted = true;
          flash("happy", { ms: 3500, message: "Oi! Eu confiro tudo antes de enviar." });
        }
      } else if (!mouse.moved && anchor) {
        // antes de mexer o mouse: fica ao lado do título
        tx = Math.min(anchor.right + 8, maxX);
        ty = Math.min(Math.max(anchor.bottom - SIZE_DESK, 8), maxY);
      } else {
        tx = Math.min(tx, maxX);
        ty = Math.min(ty, maxY);
      }

      if (!pos.init) {
        pos.x = tx;
        pos.y = ty;
        pos.init = true;
      }
      pos.x += (tx - pos.x) * k;
      pos.y += (ty - pos.y) * k;
      el.style.transform = `translate3d(${pos.x}px,${pos.y}px,0)`;
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
      el.style.transform = "";
      setLook(null);
    };
  }, [desk, flash]);

  return (
    <>
      <style>{`@keyframes mfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
      <div
        ref={box}
        className={
          desk
            ? "pointer-events-none fixed left-0 top-0 z-40"
            : "pointer-events-none fixed bottom-4 right-4 z-40"
        }
      >
        <MascotBubble
          className={`absolute bottom-full mb-1 w-max max-w-[220px] border border-black/10 ${desk ? "left-0" : "right-0"}`}
        />
        <div className="[animation:mfloat_3.2s_ease-in-out_infinite] motion-reduce:[animation:none]">
          <Mascot size={desk ? SIZE_DESK : SIZE_MOBILE} look={desk ? look : null} />
        </div>
      </div>
    </>
  );
}

export default function MascotShell({ children }: { children: React.ReactNode }) {
  return (
    <MascotProvider>
      {children}
      <Follower />
    </MascotProvider>
  );
}
