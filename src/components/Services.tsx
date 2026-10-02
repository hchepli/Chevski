"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import * as THREE from "three";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SERVICES = [
  {
    title: "Sistemas web sob medida",
    text: "Plataformas, portais e sistemas internos feitos para a rotina da sua empresa e prontos para crescer.",
    tags: ["Next.js", "Django", "PostgreSQL"],
  },
  {
    title: "Apps mobile",
    text: "Aplicativos para iOS e Android com a cara da sua marca, rápidos e fáceis de usar.",
    tags: ["iOS", "Android", "Notificações"],
  },
  {
    title: "Dashboards e BI",
    text: "Seus dados em painéis claros, para decidir com números e não no achismo.",
    tags: ["Indicadores", "Relatórios", "Tempo real"],
  },
  {
    title: "Integrações e ERP",
    text: "Conectamos sistemas, planilhas e ferramentas para os dados pararem de ser digitados duas vezes.",
    tags: ["APIs", "ERP", "Sincronização"],
  },
  {
    title: "Automações",
    text: "Tarefas repetitivas viram rotinas automáticas: menos erro e menos horas perdidas.",
    tags: ["Fluxos", "Python", "Alertas"],
  },
  {
    title: "UX/UI Design",
    text: "Interfaces pensadas com quem vai usar, validadas no Figma antes de qualquer linha de código.",
    tags: ["Figma", "Protótipo", "Design system"],
  },
];

// cor das faces: use a cor de fundo do seu site
const FACE_COLOR = 0xffffff;
const LINE_COLOR = 0x000000;

type Api = { set: (i: number, instant?: boolean) => void };

export default function Services() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const active = useRef(0);

  /* ───────── Objeto 3D: um formato por serviço ───────── */
  useEffect(() => {
    const el = stage.current;
    if (!el) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 10.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.className = "block h-full w-full";
    el.appendChild(renderer.domElement);

    const faceMat = new THREE.MeshBasicMaterial({
      color: FACE_COLOR,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const lineMat = new THREE.LineBasicMaterial({ color: LINE_COLOR });
    const disposables: { dispose: () => void }[] = [faceMat, lineMat];

    // adiciona uma peça (faces + arestas) a um grupo
    const piece = (
      parent: THREE.Group,
      geo: THREE.BufferGeometry,
      pos: [number, number, number] = [0, 0, 0],
      rot: [number, number, number] = [0, 0, 0]
    ) => {
      const edges = new THREE.EdgesGeometry(geo, 25);
      disposables.push(geo, edges);
      const g = new THREE.Group();
      g.add(new THREE.Mesh(geo, faceMat), new THREE.LineSegments(edges, lineMat));
      g.position.set(...pos);
      g.rotation.set(...rot);
      parent.add(g);
    };
    const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

    const shapes: THREE.Group[] = [];
    const make = (build: (g: THREE.Group) => void) => {
      const g = new THREE.Group();
      build(g);
      g.scale.setScalar(0);
      shapes.push(g);
    };

    // 0 · Sistemas web: janela de navegador com menu e conteúdo
    make((g) => {
      piece(g, box(3.6, 2.5, 0.14));
      piece(g, box(3.6, 0.4, 0.22), [0, 1.05, 0.04]);
      piece(g, box(0.85, 1.5, 0.22), [-1.3, -0.3, 0.04]);
      piece(g, box(2.1, 0.8, 0.22), [0.5, 0.15, 0.04]);
      piece(g, box(2.1, 0.5, 0.22), [0.5, -0.85, 0.04]);
    });

    // 1 · Apps mobile: celular
    make((g) => {
      piece(g, box(1.5, 2.9, 0.22));
      piece(g, box(1.28, 2.45, 0.26), [0, -0.05, 0]);
      piece(g, box(0.45, 0.09, 0.3), [0, 1.28, 0]);
    });

    // 2 · Dashboards e BI: gráfico de barras
    make((g) => {
      const heights = [1, 1.8, 1.3, 2.4, 3];
      piece(g, box(3.9, 0.14, 1.3), [0, -1.57, 0]);
      heights.forEach((h, i) => {
        piece(g, box(0.5, h, 0.7), [-1.5 + i * 0.75, -1.5 + h / 2, 0]);
      });
    });

    // 3 · Integrações e ERP: dois elos encaixados
    make((g) => {
      piece(g, new THREE.TorusGeometry(1, 0.28, 8, 20), [-0.7, 0, 0]);
      piece(g, new THREE.TorusGeometry(1, 0.28, 8, 20), [0.7, 0, 0], [Math.PI / 2, 0, 0]);
    });

    // 4 · Automações: engrenagem
    make((g) => {
      const teeth = 10;
      const outer = 1.5;
      const inner = 1.15;
      const shape = new THREE.Shape();
      const step = (Math.PI * 2) / teeth;
      const pts: [number, number][] = [];
      for (let t = 0; t < teeth; t++) {
        const a0 = t * step;
        [
          [0, inner],
          [0.15, outer],
          [0.45, outer],
          [0.6, inner],
        ].forEach(([f, r]) => {
          pts.push([Math.cos(a0 + f * step) * r, Math.sin(a0 + f * step) * r]);
        });
      }
      pts.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
      shape.closePath();
      const hole = new THREE.Path();
      hole.absarc(0, 0, 0.5, 0, Math.PI * 2, true);
      shape.holes.push(hole);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: false });
      geo.center();
      piece(g, geo);
    });

    // 5 · UX/UI: camadas de interface empilhadas
    make((g) => {
      piece(g, box(3, 0.12, 2.2), [0, -0.8, 0]);
      piece(g, box(3, 0.12, 2.2), [0.2, 0, 0.2]);
      piece(g, box(3, 0.12, 2.2), [0.4, 0.8, 0.4]);
    });

    const wrapper = new THREE.Group();
    wrapper.rotation.x = 0.4;
    shapes.forEach((s) => wrapper.add(s));
    scene.add(wrapper);

    // troca de formato: o atual encolhe, o novo cresce
    let cur = -1;
    const set = (i: number, instant = false) => {
      if (i === cur) return;
      cur = i;
      shapes.forEach((s) => gsap.killTweensOf(s.scale));
      shapes.forEach((s, idx) => {
        if (idx === i) {
          if (instant) s.scale.setScalar(1);
          else
            gsap.fromTo(
              s.scale,
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 1, z: 1, duration: 0.7, ease: "back.out(1.7)", delay: 0.25 }
            );
        } else if (s.scale.x > 0) {
          if (instant) s.scale.setScalar(0);
          else gsap.to(s.scale, { x: 0, y: 0, z: 0, duration: 0.3, ease: "power2.in" });
        }
      });
    };
    api.current = { set };
    set(active.current, true);

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = (time: number) => {
      if (!visible) return;
      wrapper.rotation.y = reduce ? 0.6 : time * 0.35;
      shapes.forEach((s) => (s.visible = s.scale.x > 0.001));
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    return () => {
      api.current = null;
      gsap.ticker.remove(tick);
      shapes.forEach((s) => gsap.killTweensOf(s.scale));
      ro.disconnect();
      io.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  /* ───────── Tela fixa: o scroll só troca o serviço ───────── */
  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(".servico", root.current);
      const pips = gsap.utils.toArray<HTMLElement>(".pip", root.current);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const n = items.length;
      let cur = -1;

      const go = (i: number, first = false) => {
        if (i === cur) return;
        const dir = i > cur ? 1 : -1;
        cur = i;
        active.current = i;
        api.current?.set(i, first || reduce);

        pips.forEach((p, j) =>
          gsap.to(p, {
            width: j === i ? 44 : 24,
            backgroundColor: j === i ? "#000000" : "rgba(0,0,0,0.2)",
            duration: first || reduce ? 0 : 0.3,
            overwrite: true,
          })
        );

        items.forEach((it, j) => {
          if (first || reduce) {
            gsap.set(it, { autoAlpha: j === i ? 1 : 0, y: 0 });
          } else if (j === i) {
            gsap.fromTo(
              it,
              { autoAlpha: 0, y: 32 * dir },
              { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.2, overwrite: true }
            );
          } else {
            gsap.to(it, {
              autoAlpha: 0,
              y: -32 * dir,
              duration: 0.3,
              ease: "power2.in",
              overwrite: true,
            });
          }
        });
      };

      go(0, true);

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: () => "+=" + (n - 1) * window.innerHeight * 0.7,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // remova o snap se preferir scroll 100% livre
        snap: {
          snapTo: 1 / (n - 1),
          duration: { min: 0.2, max: 0.5 },
          delay: 0.05,
        },
        onUpdate: (self) => go(Math.round(self.progress * (n - 1))),
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="servicos"
      className="relative grid h-screen grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-4 overflow-hidden px-6 pb-8 pt-24 md:grid-cols-2 md:grid-rows-[auto_1fr] md:gap-x-10 md:gap-y-0 md:px-10 md:pb-12 md:pt-32"
    >
      {/* Título (no mobile fica em cima) */}
      <h2 className="text-xl leading-tight md:col-start-1 md:row-start-1 md:text-[43px]">
        <span className="block font-bold">O que a gente constrói</span>
        <span className="block font-light text-[var(--muted)]">
          sob medida para o seu negócio.
        </span>
      </h2>

      {/* 3D: direita no desktop, entre o título e o texto no mobile */}
      <div
        aria-hidden
        className="relative min-h-0 md:col-start-2 md:row-span-2 md:row-start-1"
      >
        <div ref={stage} className="pointer-events-none absolute inset-0" />
      </div>

      {/* Texto: todos empilhados na mesma célula, só um visível por vez */}
      <div className="flex flex-col justify-center md:col-start-1 md:row-start-2">
        <div className="grid">
          {SERVICES.map((s) => (
            <article
              key={s.title}
              className="servico invisible col-start-1 row-start-1 flex flex-col gap-3 opacity-0 md:gap-5"
            >
              <h3 className="text-[clamp(1.75rem,6vw,4.25rem)] font-bold leading-[1.05] tracking-tight md:text-[clamp(2.5rem,4.5vw,4.25rem)]">
                {s.title}
              </h3>
              <p className="max-w-md text-sm font-light text-[var(--muted)] md:text-lg">
                {s.text}
              </p>
              <ul className="flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border-2 border-black px-3 py-1 text-xs font-medium md:px-4 md:py-1.5 md:text-sm"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Indicador de qual serviço está ativo */}
        <div aria-hidden className="mt-6 flex items-center gap-2 md:mt-10">
          {SERVICES.map((s) => (
            <span key={s.title} className="pip h-[3px] w-6 bg-black/20" />
          ))}
        </div>
      </div>
    </section>
  );
}
