"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Mascot } from "./mascot";

const SIZE = 135; // o corpo ocupa ~60% disso
const SPEED = 0.5; // rad/s
const TILT = -0.2; // inclinação da órbita (rad)

/**
 * Orbita a logo. Mesma caixa do palco (inset-0): quando está "atrás" (z-index 0)
 * a logo o esconde; "na frente" (z-index 20) passa por cima.
 * O estado (mood) vem do <MascotProvider>.
 */
export default function OrbitingMascot() {
  const box = useRef<HTMLDivElement>(null);
  const bot = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const boxEl = box.current!;
    const botEl = bot.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let angle = Math.PI * 0.25;
    let front = true;

    gsap.from(botEl, { opacity: 0, duration: 0.8, delay: 1.4 });

    const tick = (_t: number, deltaMs: number) => {
      angle += (deltaMs / 1000) * (reduce ? SPEED * 0.15 : SPEED);
      const w = boxEl.clientWidth;
      const h = boxEl.clientHeight;
      const rx = Math.min(w * 0.36, 340);
      const ry = h * 0.17;
      const ex = Math.cos(angle) * rx;
      const ey = Math.sin(angle) * ry;
      const x = ex * Math.cos(TILT) - ey * Math.sin(TILT);
      const y = ex * Math.sin(TILT) + ey * Math.cos(TILT);
      const depth = Math.sin(angle);
      gsap.set(botEl, { x, y, scale: 0.85 + depth * 0.2 });
      const isFront = depth > 0;
      if (isFront !== front) {
        front = isFront;
        boxEl.style.zIndex = front ? "20" : "0";
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div ref={box} className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      <div
        ref={bot}
        className="absolute left-1/2 top-1/2"
        style={{ marginLeft: -SIZE / 2, marginTop: -SIZE / 2 }}
      >
        <Mascot size={SIZE} />
      </div>
    </div>
  );
}