"use client";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import Logo3D from "./Logo3D";
import GlowShadow from "./GlowShadow";

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 40 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 6]} intensity={1.2} />
      <pointLight position={[-5, -1, -2]} color="#7c5cff" intensity={40} />

      {/* Estúdio de luz (sem baixar HDR externo): é o que faz a logo brilhar */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 5, 5]} scale={[12, 4, 1]} />
        <Lightformer form="rect" intensity={2} position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 6, 1]} />
        <Lightformer form="rect" intensity={3} color="#8b6cff" position={[6, 1, -3]} rotation-y={-Math.PI / 2} scale={[8, 6, 1]} />
        <Lightformer form="ring" intensity={2} position={[0, -4, 3]} scale={6} />
      </Environment>

      <Suspense fallback={null}>
        <GlowShadow />
        <Logo3D />
      </Suspense>
    </Canvas>
  );
}