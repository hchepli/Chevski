"use client";
import { useEffect, useState } from "react";
import gsap from "gsap";
import { Home, Folder, ChevronDown, ArrowUpRight, Menu } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { Logo } from "./Logo";

const links = [
  { label: "Início", href: "#", icon: Home },
  { label: "Cases", href: "#cases", icon: Folder },
];

export default function Navbar() {
  const [active, setActive] = useState("Início");
  const [dark, setDark] = useState(false);

  // descobre qual seção está literalmente atrás do header
  useEffect(() => {
    const PROBE_Y = 48; // centro aproximado do header
    let last = 0;
    let current = false;

    const check = () => {
      const now = performance.now();
      if (now - last < 80) return; // ~12x por segundo é suficiente
      last = now;

      const stack = document.elementsFromPoint(window.innerWidth / 2, PROBE_Y);
      let isDark = false;

      for (const node of stack) {
        const host = (node as HTMLElement).closest?.("[data-header-theme]") as
          | HTMLElement
          | null;
        if (host) {
          isDark = host.dataset.headerTheme === "dark";
          break;
        }
      }

      if (isDark !== current) {
        current = isDark;
        setDark(isDark);
      }
    };

    check();
    gsap.ticker.add(check); // roda a cada frame, independe do tipo de scroll
    return () => gsap.ticker.remove(check);
  }, []);

  // classes que mudam com o tema
  const pill = dark
    ? "border-white/20 bg-white/10 text-white"
    : "border-black/15 bg-white/30 text-black";
  const hover = dark ? "hover:bg-white/10" : "hover:bg-black/5";
  const activeBg = dark ? "bg-white/15" : "bg-black/10";
  const ctaWrap = dark ? "border-white/20" : "border-black/15";
  const cta = dark ? "bg-white text-black" : "bg-black text-white";
  const burger = dark ? "bg-white text-black" : "bg-black text-white";

  return (
    <>
      {/* Logo: branca + difference = inverte conforme o fundo */}
      <a
        href="#"
        aria-label="Início"
        className="fixed left-6 top-6 z-20 h-10 w-10 text-white mix-blend-difference md:left-10 md:top-8 md:h-12 md:w-12"
      >
        <Logo id="header-logo" className="h-full w-full" />
      </a>

      <header className="nav fixed top-0 z-20 flex w-full items-center justify-between px-6 py-6 md:px-10 md:py-8">
        {/* Espaço reservado onde a logo ficava */}
        <div className="h-10 w-10 md:h-12 md:w-12" aria-hidden />

        {/* Pílula central: só a partir de md */}
        <nav
          className={`absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-xl border p-1 backdrop-blur transition-colors duration-300 md:flex ${pill}`}
        >
          {links.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              onClick={() => setActive(label)}
              className={`flex items-center gap-2 rounded-lg px-5 py-3 text-[12px] font-medium transition-colors ${
                active === label ? activeBg : hover
              }`}
            >
              <Icon size={14} strokeWidth={1.8} />
              {label}
            </a>
          ))}
          <button
            className={`flex items-center gap-2 rounded-lg px-5 py-3 text-[12px] font-medium transition-colors ${hover}`}
            aria-haspopup="menu"
          >
            Parcerias
            <ChevronDown size={14} strokeWidth={1.8} />
          </button>
        </nav>

        {/* Lado direito */}
        <div className="flex items-center gap-2">
          <div
            className={`rounded-xl border p-1 transition-colors duration-300 ${ctaWrap}`}
          >
            <MagneticButton
              as="a"
              href="#contato"
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-medium transition-colors duration-300 md:px-5 md:py-3 ${cta}`}
            >
              Começar Projeto
              <ArrowUpRight size={16} strokeWidth={1.8} />
            </MagneticButton>
          </div>

          {/* Hambúrguer: só no mobile */}
          <div
            className={`rounded-2xl border p-1 transition-colors duration-300 md:hidden ${ctaWrap}`}
          >
            <button
              aria-label="Abrir menu"
              className={`grid h-10 w-10 place-items-center rounded-xl transition-colors duration-300 ${burger}`}
            >
              <Menu size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}