"use client";
import { useState } from "react";
import { Home, Folder, ChevronDown, ArrowUpRight, Menu } from "lucide-react";
import MagneticButton from "./MagneticButton";

const links = [
  { label: "Início", href: "#", icon: Home },
  { label: "Cases", href: "#cases", icon: Folder },
];

export default function Navbar() {
  const [active, setActive] = useState("Início");

 return (
  <header className="nav fixed top-0 z-20 flex w-full items-center justify-between px-6 py-6 md:px-10 md:py-8">
    {/* Logo */}
    <a href="#" aria-label="Início" className="h-10 w-10 md:h-12 md:w-12">
      <svg id="header-logo" viewBox="0 0 850.9 1000.0" className="h-full w-full" fill="currentColor" fillRule="evenodd">
          <path d="M639.5 879.8 L570.8 833.7 L536.5 816.5 L430.3 874.5 L398.1 861.6 L326.2 818.7 L311.2 817.6 L212.4 877.7 L421.7 1000.0 L438.8 996.8 Z M470.0 267.2 L472.1 275.8 L571.9 330.5 L598.7 319.7 L682.4 271.5 L733.9 296.1 L741.4 306.9 L741.4 422.7 L809.0 466.7 L827.3 473.2 L846.6 487.1 L850.9 486.1 L850.9 243.6 L708.2 154.5 L680.3 144.8 Z M2.1 238.2 L0.0 741.4 L2.1 759.7 L172.7 854.1 L383.0 733.9 L282.2 669.5 L266.1 673.8 L173.8 727.5 L155.6 723.2 L123.4 704.9 L111.6 693.1 L111.6 303.6 L114.8 298.3 L164.2 271.5 L195.3 283.3 L728.5 586.9 L741.4 603.0 L741.4 694.2 L694.2 726.4 L676.0 727.5 L287.6 506.4 L284.3 500.0 L364.8 452.8 L382.0 435.6 L371.2 424.9 L281.1 375.5 L260.7 383.0 L173.8 436.7 L172.7 562.2 L680.3 854.1 L694.2 849.8 L849.8 760.7 L850.9 537.6 L727.5 459.2 L170.6 144.8 L160.9 147.0 Z M212.4 122.3 L236.1 140.6 L315.5 183.5 L335.8 177.0 L426.0 124.5 L527.9 180.3 L551.5 178.1 L641.6 124.5 L641.6 120.2 L625.5 107.3 L431.3 0.0 L421.7 0.0 L258.6 91.2 Z" />
        </svg>
    </a>

    {/* Pílula central: só a partir de md */}
    <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-xl border border-black/15 bg-white/30 p-1 backdrop-blur md:flex">
              {links.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            onClick={() => setActive(label)}
            className={`flex items-center gap-2 rounded-lg px-5 py-3 text-[12px] font-medium transition-colors ${
              active === label ? "bg-black/10" : "hover:bg-black/5"
            }`}
          >
            <Icon size={14} strokeWidth={1.8} />
            {label}
          </a>
        ))}
        <button className="flex items-center gap-2 rounded-lg px-5 py-3 text-[12px] font-medium hover:bg-black/5" aria-haspopup="menu">
          Parcerias
          <ChevronDown size={14} strokeWidth={1.8} />
        </button>
    </nav>

    {/* Lado direito */}
    <div className="flex items-center gap-2">
      <div className="rounded-xl border border-black/15 p-1">
        <MagneticButton
          as="a"
          href="#contato"
          className="flex items-center gap-3 rounded-lg bg-black px-4 py-2.5 text-[12px] font-medium text-white md:px-5 md:py-3"
        >
          Começar Projeto
          <ArrowUpRight size={16} strokeWidth={1.8} className="text-white" />
        </MagneticButton>
      </div>

      {/* Hambúrguer: só no mobile */}
      <div className="rounded-2xl border border-black/15 p-1 md:hidden">
        <button
          aria-label="Abrir menu"
          className="grid h-10 w-10 place-items-center rounded-xl bg-black text-white"
        >
          <Menu size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  </header>
);
}