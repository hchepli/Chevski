"use client";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { bob } from "./motion";

// Sombra roxa dentro da cena: encolhe e some quando a logo sobe
export default function GlowShadow() {
  const mesh = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(110,80,210,0.85)");
    g.addColorStop(0.5, "rgba(130,100,225,0.35)");
    g.addColorStop(1, "rgba(150,120,235,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const b = bob(state.clock.elapsedTime); // -1..1, 1 = logo no ponto mais alto
    m.scale.set(3.4 - b * 0.4, 0.55 - b * 0.07, 1);
    (m.material as THREE.MeshBasicMaterial).opacity = 0.8 - b * 0.2;
  });

  return (
    <mesh ref={mesh} position={[0, -2.35, -0.3]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
