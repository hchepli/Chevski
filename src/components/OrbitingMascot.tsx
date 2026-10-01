"use client";
import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BloubBot, defaultCycle } from "bloub-react";

const SIZE = 130; // o corpo ocupa ~63% disso
const SPEED = 0.5; // rad/s da órbita
const TILT = -0.2; // inclinação do plano da órbita (rad)

/**
 * Bloub (nuvem) orbitando a logo como a Lua na Terra.
 * - as animações/expressões são do próprio bloub (14 estados em loop)
 * - GSAP move o bichinho numa elipse e troca o z-index: quando está "atrás"
 *   ele passa por trás do canvas 3D (a logo o esconde); na frente, por cima.
 * Este componente deve ocupar EXATAMENTE a mesma caixa do canvas.
 */
export default function OrbitingMascot() {
  const box = useRef<HTMLDivElement>(null);
  const bot = useRef<HTMLDivElement>(null);

  // BloubBot precisa do bloco atual controlado pelo pai para avançar o ciclo
  const [block, setBlock] = useState(0);
  const cycle = useMemo(() => defaultCycle().blocks, []);

  useGSAP(() => {
    const boxEl = box.current!;
    const botEl = bot.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let angle = Math.PI * 0.25;
    let front = true;

    gsap.from(botEl, { opacity: 0, duration: 0.8, delay: 1.4 });

    const tick = (_time: number, deltaMs: number) => {
      angle += (deltaMs / 1000) * (reduce ? SPEED * 0.15 : SPEED);

      const w = boxEl.clientWidth;
      const h = boxEl.clientHeight;
      const rx = Math.min(w * 0.36, 340);
      const ry = h * 0.17;

      const ex = Math.cos(angle) * rx;
      const ey = Math.sin(angle) * ry;
      // gira a elipse para inclinar a órbita
      const x = ex * Math.cos(TILT) - ey * Math.sin(TILT);
      const y = ex * Math.sin(TILT) + ey * Math.cos(TILT);

      const depth = Math.sin(angle); // -1 atrás ... 1 na frente
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
    <div
      ref={box}
      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[55vh] min-h-[320px]"
      aria-hidden
    >
      <div ref={bot} className="bloub-mascot absolute left-1/2 top-1/2 -ml-[65px] -mt-[65px]">
        <BloubBot
          size={SIZE}
          shape="nuage"
          color="violet"
          paper="#ecebf6" /* mesma cor do fundo (--bg) */
          follow
          playing
          cycle={cycle}
          block={block}
          onBlockChange={setBlock}
        />
      </div>
    </div>
  );
}
