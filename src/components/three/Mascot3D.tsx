"use client";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

// Órbita do bichinho em volta da logo (estilo Lua)
const RADIUS = 3.0;
const SPEED = 0.55; // rad/s
const TILT = new THREE.Euler(0.45, 0, -0.25); // inclinação do plano da órbita
const SCALE = 0.0055;

export default function Mascot3D() {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const svg = useLoader(SVGLoader, "/bloub.svg");

  const geometry = useMemo(() => {
    const [bodyPath, ...eyePaths] = svg.paths;
    const shape = SVGLoader.createShapes(bodyPath)[0];
    const outerCW = THREE.ShapeUtils.isClockWise(shape.getPoints());

    // olhos = furos no corpo (com o enrolamento contrário ao do contorno)
    eyePaths.forEach((p) =>
      SVGLoader.createShapes(p).forEach((s) => {
        const pts = s.getPoints(8);
        if (THREE.ShapeUtils.isClockWise(pts) === outerCW) pts.reverse();
        shape.holes.push(new THREE.Path(pts));
      })
    );

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 14,
      bevelEnabled: true,
      bevelThickness: 6,
      bevelSize: 2.5, // pequeno de propósito: não fecha os olhos
      bevelSegments: 5,
      curveSegments: 12,
    });
    geo.center();
    return geo;
  }, [svg]);

  useFrame((state) => {
    const r = root.current;
    const b = body.current;
    if (!r || !b) return;
    const t = state.clock.elapsedTime;
    const a = t * SPEED + Math.PI * 0.25;

    // posição na órbita inclinada (passa na frente e atrás da logo)
    r.position.set(Math.cos(a) * RADIUS, Math.sin(t * 1.5) * 0.1, Math.sin(a) * RADIUS).applyEuler(TILT);

    // sempre de frente para a câmera
    r.quaternion.copy(state.camera.quaternion);

    // balanço e "respiração"
    b.rotation.z = Math.sin(t * 2) * 0.08;
    const s = 1 + Math.sin(t * 3) * 0.04;
    b.scale.set(s, 2 - s, 1);
  });

  return (
    <group ref={root}>
      <group ref={body}>
        <mesh geometry={geometry} scale={[SCALE, -SCALE, SCALE]}>
          <meshPhysicalMaterial
            color="#3c288c"
            roughness={0.35}
            clearcoat={0.7}
            clearcoatRoughness={0.25}
            emissive="#2a1a70"
            emissiveIntensity={0.25}
          />
        </mesh>
      </group>
    </group>
  );
}
