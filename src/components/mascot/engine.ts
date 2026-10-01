/**
 * Motor do mascote. Zero dependências, zero React.
 * Corpo = 64 raios (um por ângulo). Trocar de forma = interpolar os raios.
 * Olhos = cápsulas "furadas" no corpo (podem virar "!" ou ✓).
 */
export type Mood =
  | "idle" | "happy" | "surprised" | "error" | "loading" | "success" | "sad" | "sleep"
  // estados de "inquieto" (rodam sozinhos quando ninguém usa o mascote)
  | "wink" | "egg" | "hexagon" | "orbit" | "burst";
export type Decor = "spinner" | "burst" | "zzz" | "comet" | null;
export type Eye = { x: number; y: number; w: number; h: number; rot: number };
export type Pose = {
  radii: number[]; // 64 raios (0..1) — unidade = R
  oy: number; // deslocamento vertical do conjunto (px)
  eyes: [Eye, Eye];
  face: number; // 1 = tem "rosto" (pisca e olha), 0 = símbolo (!, ✓)
  rgb: [number, number, number];
};

export const N = 64;
export const R = 60; // raio base em unidades do viewBox
const TAU = Math.PI * 2;
export const ANGLES = Array.from({ length: N }, (_, i) => (i / N) * TAU);
const COS = ANGLES.map(Math.cos);
const SIN = ANGLES.map(Math.sin);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const easeOutQuint = (t: number) => 1 - (1 - t) ** 5;

/* ---------- FORMAS ---------- */
type Circle = { x: number; y: number; r: number };

// união de círculos vista do centro (nuvem)
function unionOfCircles(cs: Circle[]): number[] {
  return ANGLES.map((_, i) => {
    let best = 0;
    for (const c of cs) {
      const b = COS[i] * c.x + SIN[i] * c.y;
      const d = b * b - (c.x * c.x + c.y * c.y - c.r * c.r);
      if (d >= 0) best = Math.max(best, b + Math.sqrt(d));
    }
    return best;
  });
}

// qualquer forma definida por distância (SDF) vira perfil de raios
function profileFromSDF(sdf: (x: number, y: number) => number, rMax = 1.6): number[] {
  return ANGLES.map((_, i) => {
    let lo = 0, hi = rMax;
    for (let k = 0; k < 22; k++) {
      const m = (lo + hi) / 2;
      if (sdf(COS[i] * m, SIN[i] * m) <= 0) lo = m;
      else hi = m;
    }
    return lo;
  });
}

function sdTriangle(px: number, py: number, r: number) {
  const k = Math.sqrt(3);
  let x = Math.abs(px) - r, y = py + r / k;
  if (x + k * y > 0) [x, y] = [(x - k * y) / 2, (-k * x - y) / 2];
  x -= Math.max(-2 * r, Math.min(0, x));
  return -Math.hypot(x, y) * Math.sign(y);
}

// hexágono regular (r = apótema)
function sdHexagon(px: number, py: number, r: number) {
  const kx = -0.866025404, ky = 0.5, kz = 0.577350269;
  let x = Math.abs(px), y = Math.abs(py);
  const d = 2 * Math.min(kx * x + ky * y, 0);
  x -= d * kx;
  y -= d * ky;
  x -= Math.max(-kz * r, Math.min(kz * r, x));
  y -= r;
  return Math.hypot(x, y) * Math.sign(y);
}

// k < 1 = nuvem mais achatada/caída
const cloudCircles = (k: number): Circle[] =>
  [
    { x: -0.42, y: 0.22 * k, r: 0.5 },
    { x: 0.42, y: 0.22 * k, r: 0.5 },
    { x: 0, y: 0.3 * k, r: 0.56 },
    { x: -0.2, y: -0.3 * k, r: 0.46 },
    { x: 0.26, y: -0.24 * k, r: 0.42 },
  ].map((c) => ({ ...c, r: c.r * (0.78 + 0.22 * k) }));
const CLOUD_SCALE = 1.02 / Math.max(...unionOfCircles(cloudCircles(1)));
const cloud = (k = 1) => unionOfCircles(cloudCircles(k)).map((v) => v * CLOUD_SCALE);
const circle = (r: number) => ANGLES.map(() => r);
const triangle = profileFromSDF((x, y) => sdTriangle(x, -y, 0.72) - 0.17); // "atenção"
const hexagon = profileFromSDF((x, y) => sdHexagon(x, y, 0.74) - 0.12);
// ovo: mais largo embaixo (y positivo = baixo no SVG)
const egg = ANGLES.map((_, i) => {
  const a = 0.84, b = 0.98;
  return (1 / Math.hypot(COS[i] / a, SIN[i] / b)) * (1 + 0.07 * SIN[i]);
});

/* ---------- POSES (um estado = uma pose) ---------- */
const hex = (h: string): [number, number, number] => {
  const v = parseInt(h.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
const E = (x: number, y: number, w: number, h: number, rot = 0): Eye => ({ x, y, w, h, rot });
const face = (gap: number, y: number, w: number, h: number, rot = 0): [Eye, Eye] => [
  E(-gap / 2, y, w, h, rot),
  E(gap / 2, y, w, h, -rot),
];

const BRAND = "#3c288c";

export const MOODS: Record<Mood, Pose> = {
  idle: { radii: cloud(1), oy: 0, eyes: face(28, -6, 11, 25), face: 1, rgb: hex(BRAND) },
  happy: { radii: cloud(1), oy: 0, eyes: face(30, -4, 19, 8, 14), face: 1, rgb: hex(BRAND) },
  surprised: { radii: cloud(1), oy: -2, eyes: face(34, -6, 15, 30), face: 1, rgb: hex(BRAND) },
  sad: { radii: cloud(0.85), oy: 4, eyes: face(30, 2, 12, 20, 18), face: 0.6, rgb: hex("#5b4aa8") },
  sleep: { radii: cloud(0.55), oy: 10, eyes: face(30, 4, 17, 3), face: 0, rgb: hex("#7468b8") },
  loading: { radii: circle(0.6), oy: 0, eyes: face(18, 0, 7, 14), face: 0.5, rgb: hex(BRAND) },
  // triângulo de alerta: olhos viram o "!"
  error: { radii: triangle, oy: 12, eyes: [E(0, -8, 10, 28), E(0, 19, 10, 10)], face: 0, rgb: hex("#f2a900") },
  // círculo com ✓ feito pelos dois olhos
  success: { radii: circle(0.97), oy: 0, eyes: [E(-10.5, 4, 8, 16, -45), E(7, -2.5, 8, 34, 45)], face: 0, rgb: hex("#1fa971") },

  /* --- inquieto --- */
  // pisca um olho só
  wink: { radii: cloud(1), oy: 0, eyes: [E(-14, -3, 17, 4, -8), E(14, -6, 11, 25)], face: 1, rgb: hex(BRAND) },
  // vira ovo
  egg: { radii: egg, oy: 0, eyes: face(26, -4, 11, 25), face: 1, rgb: hex("#4a35a8") },
  // vira hexágono
  hexagon: { radii: hexagon, oy: 0, eyes: face(30, -4, 11, 25), face: 1, rgb: hex("#5b3fc4") },
  // bolinha com cauda de cometa girando em volta
  orbit: { radii: circle(0.6), oy: 0, eyes: face(18, 0, 7, 14), face: 0.5, rgb: hex(BRAND) },
  // pulinho feliz soltando faíscas
  burst: { radii: cloud(1), oy: 0, eyes: face(30, -4, 19, 8, 14), face: 1, rgb: hex(BRAND) },
};

export const DECOR: Record<Mood, Decor> = {
  idle: null, happy: null, surprised: null, error: null, sad: null,
  loading: "spinner", success: "burst", sleep: "zzz",
  wink: null, egg: null, hexagon: null, orbit: "comet", burst: "burst",
};

/* ---------- INQUIETO ---------- */
// estados que o Provider sorteia quando o mouse fica parado
export const FIDGETS: Mood[] = ["wink", "burst", "egg", "orbit", "hexagon"];
// quanto tempo cada um fica na tela (ms)
export const FIDGET_HOLD: Partial<Record<Mood, number>> = {
  wink: 1100, burst: 1500, egg: 1600, orbit: 2800, hexagon: 1600,
};
// mudanças de forma são "escondidas" por uma piscada (como no bloub)
export const FORCE_BLINK = new Set<Mood>(["egg", "hexagon", "orbit"]);

/* ---------- INTERPOLAÇÃO ---------- */
const mixEye = (a: Eye, b: Eye, t: number): Eye => ({
  x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t), rot: lerp(a.rot, b.rot, t),
});

export function mix(a: Pose, b: Pose, t: number): Pose {
  return {
    radii: a.radii.map((r, i) => lerp(r, b.radii[i], t)),
    oy: lerp(a.oy, b.oy, t),
    eyes: [mixEye(a.eyes[0], b.eyes[0], t), mixEye(a.eyes[1], b.eyes[1], t)],
    face: lerp(a.face, b.face, t),
    rgb: [lerp(a.rgb[0], b.rgb[0], t), lerp(a.rgb[1], b.rgb[1], t), lerp(a.rgb[2], b.rgb[2], t)],
  };
}

export const rgbCss = (c: [number, number, number]) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;

// raios -> curva suave fechada (Catmull-Rom convertido em Bézier)
export function toPath(radii: number[], breath = 1): string {
  const p = radii.map((r, i) => [COS[i] * r * R, SIN[i] * r * R * breath]);
  const n = p.length;
  const f = (v: number) => v.toFixed(2);
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

/* ---------- MOVIMENTO POR ESTADO ---------- */
// s = segundos desde que o estado começou; clock = tempo global
export function motionAt(mood: Mood, s: number, clock: number) {
  let dx = 0, dy = Math.sin(clock * 1.4) * 2, sc = 1, rot = 0;
  switch (mood) {
    case "error": { // tremida curta que some
      const d = Math.exp(-s * 5);
      dx = Math.sin(s * 48) * 5 * d;
      rot = Math.sin(s * 48) * 3 * d;
      break;
    }
    case "success": // pulinho
    case "burst":
      dy -= Math.abs(Math.sin(s * 9)) * 16 * Math.exp(-s * 3.2);
      break;
    case "surprised":
      sc = 1 + 0.12 * Math.exp(-s * 6) * Math.sin(s * 14);
      break;
    case "wink": // inclina a cabeça de leve ao piscar
      rot = -5 * Math.min(1, s * 5) * Math.exp(-Math.max(0, s - 0.7) * 6);
      break;
    case "egg": // balança como gelatina
      sc = 1 + 0.07 * Math.exp(-s * 3) * Math.sin(s * 14);
      rot = Math.sin(s * 7) * 5 * Math.exp(-s * 2);
      break;
    case "hexagon":
      rot = Math.sin(s * 6) * 4 * Math.exp(-s * 1.8);
      dy -= Math.abs(Math.sin(s * 8)) * 6 * Math.exp(-s * 3);
      break;
    case "orbit": // bolinha "respira" enquanto a cauda gira
      sc = 1 + Math.sin(s * 5) * 0.04;
      break;
    case "sad":
      dx = Math.sin(clock * 1.1) * 1.5;
      dy += 3;
      break;
    case "sleep":
      sc = 1 + Math.sin(clock * 1.2) * 0.03;
      break;
  }
  return { dx, dy, sc, rot };
}
