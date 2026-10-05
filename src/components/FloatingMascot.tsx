"use client";
import { useContext, useEffect, useRef } from "react";
import gsap from "gsap";
import { Mascot } from "./mascot";
import { MascotContext } from "./mascot/context";

/* ---------- ajustes ---------- */
const HOME_SCROLL = 80; // px de scroll até sair do lado do título (desktop)
const TITLE_GAP = 28; // distância entre o fim do título e o mascote
// posições relativas ao cursor (desktop): a 1ª que couber na tela é usada
const OFFSETS: [number, number][] = [[-90, 60], [0, 100], [90, 60], [-90, -60]];
const PLAY_AFTER = 4000; // parado por esse tempo (ms), ele começa a brincar/orbitar
const SLEEP_AFTER = 30000; // só vale sem <MascotProvider>; com provider, dorme quando o mood vira "sleep"
const TAP_HOLD = 4500; // ms que ele fica onde você tocou, depois volta a sobrevoar
const AVOID = { w: 200, h: 180 }; // canto inferior direito reservado à prévia dos cases (celular)
const HEADER = 90; // não passa por cima do header
const MARGIN = 12;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// caixa do TEXTO do título (os spans são "block", então a caixa do elemento ocuparia a largura toda)
function textBox(el: Element) {
  const r = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue;
    r.selectNodeContents(n);
    const b = r.getBoundingClientRect();
    if (!b.width) continue;
    left = Math.min(left, b.left); right = Math.max(right, b.right);
    top = Math.min(top, b.top); bottom = Math.max(bottom, b.bottom);
  }
  return right > left ? { left, right, top, bottom } : null;
}

/**
 * Mascote que sobrevoa a tela de Cases (use <FloatingMascot /> dentro da página).
 * Marque o título com data-mascot-anchor.
 * Desktop: mora no espaço livre ao lado do título (parado, brinca e depois dorme orbitando ali);
 * depois do scroll, segue o mouse a uma distância.
 * Celular: sobrevoa a borda direita; ao tocar, vai até o toque. Nunca no canto inferior direito.
 */
export default function FloatingMascot() {
  const box = useRef<HTMLDivElement>(null);
  const ctx = useContext(MascotContext); // opcional: sem provider ele funciona, só não "reage"
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  useEffect(() => {
    const el = box.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const input = { touch: !window.matchMedia("(hover: hover) and (pointer: fine)").matches };
    const pointer = { x: 0, y: 0, seen: false };
    const tap = { x: 0, y: 0, t: -1e9 };
    const pos = { x: 0, y: 0, rot: 0, init: false };
    let anchor: Element | null = null;
    let off = 0;

    // aparece já, sem esperar nada
    gsap.to(el, { opacity: 1, duration: 0.5, ease: "power2.out" });

    const born = performance.now();
    let lastActive = born;
    let angle = 0;
    let amp = 0.12; // 0 = parado, 1 = órbita inteira

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        input.touch = false;
        pointer.x = e.clientX; pointer.y = e.clientY; pointer.seen = true;
        return;
      }
      input.touch = true;
      if (e.type === "pointerdown" || e.buttons) {
        tap.x = e.clientX; tap.y = e.clientY; tap.t = performance.now();
        if (e.type === "pointerdown") ctxRef.current?.flash("happy", { ms: 900 });
      }
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    // qualquer atividade zera o "parado" (mesmos eventos do MascotProvider)
    const bump = () => { lastActive = performance.now(); };
    const ACTIVITY = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"] as const;
    ACTIVITY.forEach((e) => window.addEventListener(e, bump, { passive: true }));

    const tick = (_t: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 50) / 1000;
      const w = window.innerWidth, h = window.innerHeight;
      const half = el.offsetWidth / 2;
      const body = half * 0.6; // o corpo ocupa ~60% da caixa
      const now = performance.now();
      const t = now / 1000;

      // parado -> brinca (órbita ampla) -> dorme (órbita lenta e curta)
      const idleFor = now - lastActive;
      const sleeping = ctxRef.current ? ctxRef.current.mood === "sleep" : idleFor > SLEEP_AFTER;
      const playing = !sleeping && idleFor > PLAY_AFTER;
      angle += dt * (reduce ? 0 : sleeping ? 0.2 : playing ? 0.9 : 0.4);
      amp += ((reduce ? 0 : sleeping ? 0.45 : playing ? 1 : 0.12) - amp) * Math.min(1, dt * 1.5);

      if (!anchor || !anchor.isConnected) anchor = document.querySelector("[data-mascot-anchor]");
      const tb = anchor ? textBox(anchor) : null;

      let tx: number, ty: number, k = 3;

      if (input.touch) {
        if (performance.now() - tap.t < TAP_HOLD) {
          // vai até o toque, um pouco acima do dedo
          tx = tap.x; ty = tap.y - body - 44; k = 4;
        } else {
          // sobrevoa a borda direita, na altura do título (a sobra do título deixa esse espaço livre)
          const cy = tb ? (tb.top + tb.bottom) / 2 : h * 0.3;
          const m = Math.max(amp, 0.45);
          tx = w - body - 8 + Math.cos(angle) * 10 * m;
          ty = clamp(cy, HEADER + body, h * 0.45) + Math.sin(angle) * 40 * m;
          k = 2;
        }
        // nunca no canto inferior direito (prévia dos cases)
        const zx = w - AVOID.w, zy = h - AVOID.h;
        if (tx + body > zx && ty + body > zy) ty = zy - body - 8;
      } else if (tb && window.scrollY < HOME_SCROLL) {
        // desktop, topo: mora no espaço livre à direita do título e orbita ali
        const left = tb.right + TITLE_GAP, right = w - 24;
        const rx = clamp(((right - left) / 2 - body - 8) * 0.8, 0, 280);
        const ry = clamp((tb.bottom - tb.top) / 2, 40, 150);
        const tilt = -0.2;
        const ex = Math.cos(angle) * rx * amp, ey = Math.sin(angle) * ry * amp;
        tx = Math.max((left + right) / 2 + ex * Math.cos(tilt) - ey * Math.sin(tilt), left + body);
        ty = (tb.top + tb.bottom) / 2 + ex * Math.sin(tilt) + ey * Math.cos(tilt);
      } else if (pointer.seen) {
        // desktop: segue o mouse, mas com distância
        const fits = (i: number) => {
          const x = pointer.x + OFFSETS[i][0], y = pointer.y + OFFSETS[i][1];
          return x >= body + MARGIN && x <= w - body - MARGIN && y >= HEADER && y <= h - body - MARGIN;
        };
        if (!fits(off)) {
          const i = OFFSETS.findIndex((_, n) => fits(n));
          if (i >= 0) off = i;
        }
        tx = pointer.x + OFFSETS[off][0];
        ty = pointer.y + OFFSETS[off][1];
      } else {
        tx = w - body - 40; ty = h * 0.35;
      }

      tx = clamp(tx, body + MARGIN, w - body - MARGIN);
      ty = clamp(ty, body + MARGIN, h - body - MARGIN);

      if (now - born < 1200) k = Math.max(k, 12); // no começo cola no lugar (o título ainda está animando)
      if (!pos.init) { pos.x = tx; pos.y = ty; pos.init = true; }
      const prevX = pos.x;
      const a = 1 - Math.exp(-(reduce ? 8 : k) * dt);
      pos.x += (tx - pos.x) * a;
      pos.y += (ty - pos.y) * a;

      // inclina um pouco na direção em que se move + flutuação leve
      const vx = dt ? (pos.x - prevX) / dt : 0;
      pos.rot += ((reduce ? 0 : clamp(vx * 0.012, -14, 14)) - pos.rot) * 0.1;
      const bob = reduce ? 0 : Math.sin(t * 1.6) * 4;

      gsap.set(el, { x: pos.x - half, y: pos.y - half + bob, rotation: pos.rot });
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ACTIVITY.forEach((e) => window.removeEventListener(e, bump));
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <div
      ref={box}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-30 h-[84px] w-[84px] opacity-0 will-change-transform md:h-[110px] md:w-[110px]"
    >
      <Mascot size={110} className="h-full w-full" />
    </div>
  );
}
