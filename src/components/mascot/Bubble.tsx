"use client";
import { useEffect, useState } from "react";
import { useMascot } from "./context";

/** Balão de fala: mostra a mensagem atual do mascote */
export default function MascotBubble({ className = "" }: { className?: string }) {
  const { message } = useMascot();
  const [text, setText] = useState("");
  useEffect(() => {
    if (message) setText(message); // mantém o texto enquanto some
  }, [message]);

  return (
    <div
      aria-hidden="true"
      className={`rounded-2xl bg-white px-4 py-2 text-sm font-medium shadow-sm transition duration-300 ${
        message ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
      } ${className}`}
    >
      {text}
    </div>
  );
}
