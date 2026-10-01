"use client";
import { useRef } from "react";
import gsap from "gsap";

type Props = {
  as?: "a" | "button";
  href?: string;
  className?: string;
  children: React.ReactNode;
  strength?: number;
  onHover?: (on: boolean) => void;
};

// Botão que "puxa" em direção ao mouse
export default function MagneticButton({ as = "button", href, className, children, strength = 0.25, onHover }: Props) {
  const ref = useRef<HTMLElement>(null);

  const move = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    gsap.to(el, {
      x: (e.clientX - (r.left + r.width / 2)) * strength,
      y: (e.clientY - (r.top + r.height / 2)) * strength,
      duration: 0.4,
      ease: "power3.out",
    });
  };
  const leave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    onHover?.(false);
  };

  const common = { className, onMouseMove: move, onMouseLeave: leave, onMouseEnter: () => onHover?.(true) };

  return as === "a" ? (
    <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} {...common}>{children}</a>
  ) : (
    <button ref={ref as React.Ref<HTMLButtonElement>} {...common}>{children}</button>
  );
}
