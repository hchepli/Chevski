"use client";
import dynamic from "next/dynamic";

// Three.js não roda no servidor
const Scene = dynamic(() => import("./three/Scene"), { ssr: false });

export default function SceneClient() {
  return <Scene />;
}
