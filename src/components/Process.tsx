"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import * as THREE from "three";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STEPS = [
  {
    title: "Entender",
    text: "Ouvimos o problema antes de falar de tecnologia. Mapeamos o que trava o seu negócio hoje e o que precisa mudar.",
    out: "Escopo claro",
  },
  {
    title: "Desenhar",
    text: "Transformamos a ideia em fluxos e telas. Você valida o produto no Figma antes de existir uma linha de código.",
    out: "Protótipo navegável",
  },
  {
    title: "Construir",
    text: "Desenvolvimento em ciclos curtos, com entregas semanais que você pode testar de verdade.",
    out: "Versões semanais",
  },
  {
    title: "Lançar",
    text: "Testes, segurança e deploy. O sistema entra no ar com monitoramento e documentação.",
    out: "Sistema no ar",
  },
  {
    title: "Evoluir",
    text: "Depois do lançamento a gente continua: suporte, ajustes e novas funcionalidades conforme o negócio cresce.",
    out: "Suporte contínuo",
  },
];

// cor das faces do cubo: use a cor de fundo do seu site
const FACE_COLOR = 0xffffff;
const LINE_COLOR = 0x000000;

// pseudo-aleatório determinístico (-1 a 1)
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};
const pad = (n: number) => String(n).padStart(2, "0");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function Process() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  // progresso do scroll (0 → 1), lido pelo loop do three
  const progress = useRef(0);

  /* ───────── Cubo 3D (fica parado na tela, só gira devagar) ───────── */
  useEffect(() => {
    const el = stage.current;
    if (!el) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 24);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.className = "block h-full w-full";
    el.appendChild(renderer.domElement);

    // 27 pedaços (3x3x3). Cada um tem uma posição "quebrada" e uma "certa".
    const boxGeo = new THREE.BoxGeometry(0.94, 0.94, 0.94);
    const edgeGeo = new THREE.EdgesGeometry(boxGeo);
    const faceMat = new THREE.MeshBasicMaterial({
      color: FACE_COLOR,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const lineMat = new THREE.LineBasicMaterial({ color: LINE_COLOR });

    const group = new THREE.Group();
    group.rotation.x = 0.55;
    scene.add(group);

    type Piece = {
      obj: THREE.Group;
      home: THREE.Vector3;
      off: THREE.Vector3;
      rot: THREE.Vector3;
      delay: number;
      seed: number;
    };
    const pieces: Piece[] = [];
    let n = 0;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const obj = new THREE.Group();
          obj.add(new THREE.Mesh(boxGeo, faceMat));
          obj.add(new THREE.LineSegments(edgeGeo, lineMat));
          const home = new THREE.Vector3(x, y, z);
          const dir =
            home.length() > 0
              ? home.clone().normalize()
              : new THREE.Vector3(rnd(n + 1), rnd(n + 2), rnd(n + 3));
          const off = dir
            .multiplyScalar(1.6 + (rnd(n + 4) + 1) * 1.4)
            .add(new THREE.Vector3(rnd(n + 5), rnd(n + 6), rnd(n + 7)).multiplyScalar(1.1));
          const rot = new THREE.Vector3(rnd(n + 8), rnd(n + 9), rnd(n + 10)).multiplyScalar(Math.PI);
          pieces.push({ obj, home, off, rot, delay: (rnd(n + 11) + 1) / 2, seed: n });
          group.add(obj);
          n++;
        }
      }
    }

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // centro do cubo a ~36% da altura da seção (o canvas agora cobre ela toda)
      const visibleH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      group.position.y = (0.5 - 0.36) * visibleH;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let smooth = reduce ? 1 : 0;

    const tick = (time: number) => {
      if (!visible) return;
      smooth += ((reduce ? 1 : progress.current) - smooth) * 0.1;

      for (const p of pieces) {
        // cada pedaço se conserta numa hora diferente; todos encaixados em p = 1
        const t = clamp01((smooth - p.delay * 0.55) / 0.45);
        const k = Math.pow(1 - t, 3);
        const float = Math.sin(time * 1.2 + p.seed) * 0.08 * k;
        p.obj.position.set(
          p.home.x + p.off.x * k,
          p.home.y + p.off.y * k + float,
          p.home.z + p.off.z * k
        );
        p.obj.rotation.set(p.rot.x * k, p.rot.y * k, p.rot.z * k);
      }

      group.rotation.y = time * 0.3;
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      boxGeo.dispose();
      edgeGeo.dispose();
      faceMat.dispose();
      lineMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  /* ───────── Scroll horizontal (pin) com pausa em cada tela ───────── */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const N = STEPS.length;
        const DURATION = 10; // unidades da timeline
        const SCROLL_PER_UNIT = 40; // % da altura da tela por unidade
        const HOLD = DURATION * 0.06; // respiro no começo/fim
        const step = (DURATION - HOLD * 2) / (N - 1); // espaço de cada etapa
        const TRANS = step * 0.4; // só 40% é movimento, 60% é pausa

        const state = { p: 0 };
        const update = () => {
          progress.current = state.p;
          if (fill.current) fill.current.style.transform = `scaleX(${state.p})`;
          if (counter.current) {
            counter.current.textContent = pad(Math.round(state.p * (N - 1)) + 1);
          }
        };

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=" + DURATION * SCROLL_PER_UNIT + "%",
            pin: true,
            scrub: 0.3,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // reserva a duração total
        tl.to({}, { duration: DURATION }, 0);

        for (let k = 1; k < N; k++) {
          const at = HOLD + (k - 1) * step;

          // move o trilho de uma tela para a próxima
          tl.to(
            track.current,
            {
              x: () => -k * window.innerWidth,
              ease: "power2.inOut",
              duration: TRANS,
            },
            at
          );

          // progresso (cubo, barra e contador) acompanha a mesma transição
          tl.to(
            state,
            {
              p: k / (N - 1),
              ease: "power2.inOut",
              duration: TRANS,
              onUpdate: update,
            },
            at
          );
        }

        update();
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="processo"
      className="relative h-screen overflow-hidden motion-reduce:h-auto motion-reduce:overflow-visible"
    >
      {/* Topo: título da seção + contador */}
      <div className="absolute inset-x-6 top-24 z-20 flex items-center justify-between text-sm font-medium md:inset-x-10 md:top-28 motion-reduce:hidden">
        <span>Como trabalhamos</span>
        <span className="tabular-nums">
          <span ref={counter}>01</span>
          <span className="text-[var(--muted)]"> / {pad(STEPS.length)}</span>
        </span>
      </div>

      {/* Cubo: canvas cobre a seção inteira (nada corta os cubos) e fica por cima do texto */}
      <div
        ref={stage}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 motion-reduce:hidden"
      />

      {/* Trilho horizontal: só as palavras mudam */}
      <div
        ref={track}
        className="relative z-20 flex h-full w-max motion-reduce:w-full motion-reduce:flex-col"
      >
        {STEPS.map((s) => (
          <article
            key={s.title}
            className="flex h-full w-screen shrink-0 flex-col justify-end px-6 pb-28 md:px-10 motion-reduce:h-auto motion-reduce:w-full motion-reduce:py-20"
          >
            <h2 className="text-[clamp(3rem,11vw,10rem)] font-bold leading-[0.95] tracking-tight">
              {s.title}
            </h2>

            <div className="mt-5 flex flex-col gap-5 md:mt-8 md:flex-row md:items-end md:justify-between">
              <p className="max-w-md text-base font-light text-[var(--muted)] md:text-lg">
                {s.text}
              </p>
              <span className="w-fit whitespace-nowrap rounded-full border-2 border-black px-5 py-2 text-sm font-medium">
                {s.out}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Linha de progresso */}
      <div
        aria-hidden
        className="absolute inset-x-6 bottom-10 z-20 h-[3px] bg-black/15 md:inset-x-10 motion-reduce:hidden"
      >
        <span
          ref={fill}
          className="block h-full origin-left scale-x-0 bg-black"
        />
      </div>
    </section>
  );
}
