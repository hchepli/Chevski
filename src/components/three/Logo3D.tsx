"use client";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useFrame, useLoader } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { bob } from "./motion";

const SCALE = 0.0035; // tamanho da logo na cena

export default function Logo3D() {
  const intro = useRef<THREE.Group>(null); // animação de entrada (GSAP)
  const tilt = useRef<THREE.Group>(null); // mouse + flutuação
  const svg = useLoader(SVGLoader, "/logo.svg");

  const geometry = useMemo(() => {
    const shapes = svg.paths.flatMap((p) => SVGLoader.createShapes(p));
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: 60,
      bevelEnabled: true,
      bevelThickness: 8,
      bevelSize: 6,
      bevelSegments: 5,
      curveSegments: 4,
    });
    geo.center();
    return geo;
  }, [svg]);

  // Entrada: giro + escala
  useEffect(() => {
    const g = intro.current;
    if (!g) return;
    const ctx = gsap.context(() => {
      gsap.from(g.rotation, { y: -Math.PI * 1.25, duration: 1.8, ease: "power3.out" });
      gsap.from(g.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 1.4, ease: "back.out(1.6)" });
    });
    return () => ctx.revert();
  }, []);

  useFrame((state) => {
    const g = tilt.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // inclinação suave e limitada seguindo o mouse
    g.rotation.y += (state.pointer.x * 0.45 - g.rotation.y) * 0.05;
    g.rotation.x += (-state.pointer.y * 0.25 - g.rotation.x) * 0.05;
    g.position.y = bob(t) * 0.12;
  });

  return (
    <group ref={intro}>
      <group ref={tilt}>
        {/* Y negativo: o SVG tem o eixo Y invertido (o Three corrige a face sozinho) */}
        <mesh geometry={geometry} scale={[SCALE, -SCALE, SCALE]}>
          <meshPhysicalMaterial
            color="#0c0c11"
            metalness={0.55}
            roughness={0.28}
            clearcoat={1}
            clearcoatRoughness={0.12}
            envMapIntensity={1.4}
          />
        </mesh>
      </group>
    </group>
  );
}
