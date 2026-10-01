"use client";
import { useContext, useEffect, useId, useRef } from "react";
import { MascotContext } from "./context";
import { DECOR, FORCE_BLINK, MOODS, R, clamp, easeOutQuint, mix, motionAt, rgbCss, toPath, type Eye, type Mood, type Pose } from "./engine";

type Props = {
  /** se omitido, usa o estado do <MascotProvider> */
  mood?: Mood;
  size?: number;
  /** direção do olhar (-1..1). Se null, segue o mouse (quando follow=true) */
  look?: { x: number; y: number } | null;
  follow?: boolean;
  className?: string;
};

const eyeAttrs = (e: Eye) => ({
  x: -e.w / 2, y: -e.h / 2, width: e.w, height: e.h, rx: Math.min(e.w, e.h) / 2,
  transform: `translate(${e.x} ${e.y}) rotate(${e.rot})`,
});

const TRAIL = 6;

export default function Mascot({ mood: moodProp, size = 160, look = null, follow = true, className }: Props) {
  const ctx = useContext(MascotContext);
  const mood: Mood = moodProp ?? ctx?.mood ?? "idle";
  const id = useId().replace(/:/g, "");

  const first = useRef<Pose>(MOODS[mood]).current; // valores iniciais estáveis (o loop cuida do resto)

  const svg = useRef<SVGSVGElement>(null);
  const root = useRef<SVGGElement>(null);
  const body = useRef<SVGPathElement>(null);
  const fillRect = useRef<SVGRectElement>(null);
  const decor = useRef<SVGGElement>(null);
  const eyes = useRef<(SVGRectElement | null)[]>([]);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const trail = useRef<(SVGCircleElement | null)[]>([]);
  const sparks = useRef<(SVGCircleElement | null)[]>([]);
  const zs = useRef<(SVGTextElement | null)[]>([]);

  const cur = useRef<Pose>(first);
  const tr = useRef({ from: first, to: first, t0: 0, start: 0, mood });
  const lookProp = useRef(look);
  const pointer = useRef({ x: 0, y: 0 });
  const lastMove = useRef(0);
  const eye = useRef({ x: 0, y: 0 });
  const alpha = useRef({ spinner: 0, zzz: 0, comet: 0 });
  const visible = useRef(true);
  const reduce = useRef(false);

  useEffect(() => {
    lookProp.current = look;
  }, [look]);

  // troca de estado: parte da pose que está na tela (sem pulo)
  useEffect(() => {
    const now = performance.now();
    tr.current = { from: cur.current, to: MOODS[mood], t0: now, start: now, mood };
  }, [mood]);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lastMove.current = performance.now();
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    if (svg.current) io.observe(svg.current);

    const move = (e: PointerEvent) => {
      lastMove.current = performance.now();
      const r = svg.current?.getBoundingClientRect();
      if (!r) return;
      pointer.current.x = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1);
      pointer.current.y = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2), -1, 1);
    };
    if (follow) window.addEventListener("pointermove", move, { passive: true });

    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible.current) return;

      const T = tr.current;
      const k = clamp((now - T.t0) / (reduce.current ? 160 : 460));
      const pose = mix(T.from, T.to, easeOutQuint(k));
      cur.current = pose;

      const s = (now - T.start) / 1000;
      const clock = now / 1000;
      const m = reduce.current ? { dx: 0, dy: 0, sc: 1, rot: 0 } : motionAt(T.mood, s, clock);
      const pop = reduce.current ? 0 : Math.sin(k * Math.PI) * 0.07;
      const breath = 1 + Math.sin(clock * 1.8) * 0.02;
      // piscada normal a cada 4,2 s + piscada forçada que "esconde" a troca de forma
      const forced = FORCE_BLINK.has(T.mood) && s < 0.22;
      const blink = forced || clock % 4.2 < 0.14 ? 0.12 : 1;

      // olhar suavizado: segue o mouse; se o mouse para, o olhar passeia sozinho
      const wandering = now - lastMove.current > 2500;
      const drift = { x: Math.sin(clock * 0.7) * 0.7, y: Math.sin(clock * 0.5 + 1) * 0.35 };
      const target = lookProp.current ?? (follow ? (wandering ? drift : pointer.current) : { x: 0, y: 0 });
      eye.current.x += (target.x - eye.current.x) * 0.08;
      eye.current.y += (target.y - eye.current.y) * 0.08;

      root.current?.setAttribute("transform", `translate(${m.dx} ${m.dy + pose.oy}) rotate(${m.rot}) scale(${m.sc + pop})`);
      body.current?.setAttribute("d", toPath(pose.radii, breath));
      const color = rgbCss(pose.rgb);
      fillRect.current?.setAttribute("fill", color);
      decor.current?.setAttribute("fill", color);

      pose.eyes.forEach((e, i) => {
        const el = eyes.current[i];
        if (!el) return;
        const f = pose.face;
        const h = Math.max(e.h * (1 - (1 - blink) * f), 1.2);
        el.setAttribute("x", String(-e.w / 2));
        el.setAttribute("y", String(-h / 2));
        el.setAttribute("width", String(e.w));
        el.setAttribute("height", String(h));
        el.setAttribute("rx", String(Math.min(e.w, h) / 2));
        el.setAttribute("transform", `translate(${e.x + eye.current.x * 9 * f} ${e.y + eye.current.y * 7 * f}) rotate(${e.rot})`);
      });

      // enfeites
      const want = DECOR[T.mood];
      const A = alpha.current;
      A.spinner += ((want === "spinner" ? 1 : 0) - A.spinner) * 0.18;
      A.zzz += ((want === "zzz" ? 1 : 0) - A.zzz) * 0.18;
      A.comet += ((want === "comet" ? 1 : 0) - A.comet) * 0.18;

      dots.current.forEach((el, i) => {
        if (!el) return;
        const a = clock * 4.5 + (i * Math.PI * 2) / 3;
        el.setAttribute("cx", String(Math.cos(a) * 52));
        el.setAttribute("cy", String(Math.sin(a) * 52));
        el.setAttribute("opacity", String(A.spinner));
      });

      // cometa: uma cabeça + cauda que vai sumindo, girando em volta da bolinha
      trail.current.forEach((el, i) => {
        if (!el) return;
        const a = clock * 5 - i * 0.24;
        el.setAttribute("cx", String(Math.cos(a) * 50));
        el.setAttribute("cy", String(Math.sin(a) * 50));
        el.setAttribute("r", String(Math.max(1.2, 5.5 - i * 0.8)));
        el.setAttribute("opacity", String(A.comet * (1 - i / TRAIL)));
      });

      const bursting = T.mood === "success" || T.mood === "burst";
      const bp = bursting ? clamp(s / 0.8) : 1;
      sparks.current.forEach((el, i) => {
        if (!el) return;
        const a = (i * Math.PI * 2) / 8 + 0.2;
        const dist = R * (1.02 + 0.5 * easeOutQuint(bp));
        el.setAttribute("cx", String(Math.cos(a) * dist));
        el.setAttribute("cy", String(Math.sin(a) * dist));
        el.setAttribute("r", String(1 + 5 * (1 - bp)));
        el.setAttribute("opacity", String(bursting && bp < 1 ? 1 - bp * bp : 0));
      });

      zs.current.forEach((el, j) => {
        if (!el) return;
        const ph = (clock * 0.45 + j / 3) % 1;
        el.setAttribute("x", String(34 + ph * 16));
        el.setAttribute("y", String(-34 - ph * 30));
        el.setAttribute("font-size", String(10 + ph * 9));
        el.setAttribute("opacity", String(Math.sin(ph * Math.PI) * A.zzz));
      });
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", move);
    };
  }, [follow]);

  return (
    <svg ref={svg} width={size} height={size} viewBox="-100 -100 200 200" aria-hidden="true" className={className} style={{ overflow: "visible" }}>
      <defs>
        {/* corpo branco + olhos pretos = olhos viram "furos" */}
        <mask id={`m${id}`} maskUnits="userSpaceOnUse" x="-200" y="-200" width="400" height="400">
          <path ref={body} d={toPath(first.radii)} fill="#fff" />
          {first.eyes.map((e, i) => (
            <rect key={i} ref={(el) => { eyes.current[i] = el; }} fill="#000" {...eyeAttrs(e)} />
          ))}
        </mask>
      </defs>
      <g ref={root}>
        <rect ref={fillRect} x="-150" y="-150" width="300" height="300" fill={rgbCss(first.rgb)} mask={`url(#m${id})`} />
        <g ref={decor} fill={rgbCss(first.rgb)}>
          {[0, 1, 2].map((i) => (
            <circle key={`d${i}`} ref={(el) => { dots.current[i] = el; }} r="5" opacity="0" />
          ))}
          {Array.from({ length: TRAIL }, (_, i) => (
            <circle key={`t${i}`} ref={(el) => { trail.current[i] = el; }} r="5" opacity="0" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={`s${i}`} ref={(el) => { sparks.current[i] = el; }} r="5" opacity="0" />
          ))}
          {[0, 1, 2].map((j) => (
            <text key={`z${j}`} ref={(el) => { zs.current[j] = el; }} fontWeight="700" opacity="0">z</text>
          ))}
        </g>
      </g>
    </svg>
  );
}
