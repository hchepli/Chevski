"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { Home, Folder, Users, ChevronDown, ArrowUpRight, Gift, Lightbulb } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { Logo } from "./Logo";

const links = [
  { label: "Início", href: "/", icon: Home },
  { label: "Cases", href: "/cases", icon: Folder },
];

// ajuste as rotas se usar outras
const PARCERIAS_BASE = "/parcerias";
const parcerias = [
  {
    label: "Indique e Ganhe",
    href: "/parcerias/indique-e-ganhe",
    icon: Gift,
    desc: "Indique e receba 15% do projeto.",
  },
  {
    label: "Seja Sócio",
    href: "/parcerias/seja-socio",
    icon: Lightbulb,
    desc: "A ideia é sua, a tecnologia é nossa.",
  },
];

const CTA_HREF = "/#contato"; // "#contato" sozinho não funciona fora da home

export default function Navbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [drop, setDrop] = useState(false); // dropdown de Parcerias (desktop)
  const [menu, setMenu] = useState(false); // menu mobile
  const [mobDrop, setMobDrop] = useState(false); // Parcerias dentro do menu mobile

  const dropWrap = useRef<HTMLDivElement>(null);
  const dropPanel = useRef<HTMLDivElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);

  // item ativo vem da URL (e não de um estado local)
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
  const parceriasActive = pathname === PARCERIAS_BASE || pathname.startsWith(PARCERIAS_BASE + "/");

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
        const host = (node as HTMLElement).closest?.("[data-header-theme]") as HTMLElement | null;
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

  // trocou de página: fecha tudo
  useEffect(() => {
    setDrop(false);
    setMenu(false);
    setMobDrop(false);
  }, [pathname]);

  // dropdown: fecha ao clicar fora ou com Esc
  useEffect(() => {
    if (!drop) return;
    const onDown = (e: PointerEvent) => {
      if (!dropWrap.current?.contains(e.target as Node)) setDrop(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrop(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [drop]);

  // menu mobile: trava o scroll, fecha com Esc e ao virar desktop
  useEffect(() => {
    if (!menu) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    const mq = window.matchMedia("(min-width: 768px)");
    const onMq = () => mq.matches && setMenu(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [menu]);

  // entradas animadas
  useEffect(() => {
    if (drop && dropPanel.current)
      gsap.fromTo(
        dropPanel.current,
        { opacity: 0, y: -8, scale: 0.97, transformOrigin: "top right" },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "power2.out" }
      );
  }, [drop]);

  useEffect(() => {
    const p = menuPanel.current;
    if (!menu || !p) return;
    gsap.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(p.querySelectorAll("[data-m]"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, delay: 0.05, ease: "power3.out" });
  }, [menu]);

  // classes que mudam com o tema
  const pill = dark ? "border-white/20 bg-white/10 text-white" : "border-black/15 bg-white/30 text-black";
  const hover = dark ? "hover:bg-white/10" : "hover:bg-black/5";
  const activeBg = dark ? "bg-white/15" : "bg-black/10";
  const ctaWrap = dark ? "border-white/20" : "border-black/15";
  const cta = dark ? "bg-white text-black" : "bg-black text-white";
  const burger = dark ? "bg-white text-black" : "bg-black text-white";
  const panel = dark ? "border-white/15 bg-[#121212] text-white" : "border-black/10 bg-white text-black";
  const panelItem = dark ? "hover:bg-white/10" : "hover:bg-black/5";
  const panelIcon = dark ? "bg-white/10" : "bg-black/5";
  const panelDesc = dark ? "text-white/60" : "text-black/55";

  const bar = "absolute left-0 top-1/2 -mt-px h-[2px] w-full rounded-full bg-current transition-all duration-300 ease-in-out";
  const itemBase = "flex items-center gap-2 rounded-lg px-5 py-3 text-[12px] font-medium transition-colors";

  return (
    <>
      {/* Logo: branca + difference = inverte conforme o fundo */}
      <Link
        href="/"
        aria-label="Início"
        className="fixed left-6 top-6 z-40 h-10 w-10 text-white mix-blend-difference md:left-10 md:top-8 md:h-12 md:w-12"
      >
        <Logo id="header-logo" className="h-full w-full" />
      </Link>

      <header className="nav fixed top-0 z-40 flex w-full items-center justify-between px-6 py-6 md:px-10 md:py-8">
        {/* Espaço reservado onde a logo ficava */}
        <div className="h-10 w-10 md:h-12 md:w-12" aria-hidden />

        {/* Pílula central: só a partir de md */}
        <nav
          className={`absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-xl border p-1 backdrop-blur transition-colors duration-300 md:flex ${pill}`}
        >
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`${itemBase} ${isActive(href) ? activeBg : hover}`}
            >
              <Icon size={14} strokeWidth={1.8} />
              {label}
            </Link>
          ))}

          {/* Parcerias: dropdown no clique */}
          <div ref={dropWrap} className="relative">
            <button
              type="button"
              onClick={() => setDrop((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={drop}
              className={`${itemBase} ${drop || parceriasActive ? activeBg : hover}`}
            >
              Parcerias
              <ChevronDown size={14} strokeWidth={1.8} className={`transition-transform duration-300 ${drop ? "rotate-180" : ""}`} />
            </button>

            {drop && (
              <div ref={dropPanel} role="menu" className={`absolute right-0 top-full mt-3 w-[320px] rounded-2xl border p-2 shadow-xl ${panel}`}>
                {parcerias.map(({ label, href, icon: Icon, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    onClick={() => setDrop(false)}
                    className={`flex gap-3 rounded-xl p-3 transition-colors ${panelItem}`}
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${panelIcon}`}>
                      <Icon size={16} strokeWidth={1.8} />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[13px] font-semibold">{label}</span>
                      <span className={`truncate text-[12px] ${panelDesc}`}>{desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Lado direito */}
        <div className="flex items-center gap-2">
          <div className={`rounded-xl border p-1 transition-colors duration-300 ${ctaWrap}`}>
            <MagneticButton
              as="a"
              href={CTA_HREF}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-medium transition-colors duration-300 md:px-5 md:py-3 ${cta}`}
            >
              Começar Projeto
              <ArrowUpRight size={16} strokeWidth={1.8} />
            </MagneticButton>
          </div>

          {/* Hambúrguer: só no mobile */}
          <div className={`rounded-2xl border p-1 transition-colors duration-300 md:hidden ${ctaWrap}`}>
            <button
              type="button"
              aria-label={menu ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menu}
              onClick={() => setMenu((v) => !v)}
              className={`grid h-10 w-10 place-items-center rounded-xl transition-colors duration-300 ${burger}`}
            >
              {/* 3 barras que viram X */}
              <span className="relative block h-4 w-[18px]" aria-hidden>
                <span className={`${bar} ${menu ? "translate-y-0 rotate-45" : "-translate-y-[6px]"}`} />
                <span className={`${bar} ${menu ? "scale-x-0 opacity-0" : ""}`} />
                <span className={`${bar} ${menu ? "translate-y-0 -rotate-45" : "translate-y-[6px]"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile: tela cheia, abaixo do header */}
      {menu && (
        <div
          ref={menuPanel}
          data-header-theme="light"
          className="fixed inset-0 z-[39] overflow-y-auto bg-white/90 px-6 pb-10 pt-28 text-black backdrop-blur-xl md:hidden"
        >
          <ul className="flex flex-col">
            {links.map(({ label, href, icon: Icon }) => (
              <li key={href} data-m className="border-b border-black/10">
                <Link
                  href={href}
                  onClick={() => setMenu(false)}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={`flex items-center gap-3 py-5 text-2xl font-semibold tracking-tight ${isActive(href) ? "text-black" : "text-black/50"}`}
                >
                  <Icon size={22} strokeWidth={1.8} />
                  {label}
                </Link>
              </li>
            ))}

            <li data-m className="border-b border-black/10">
              <button
                type="button"
                onClick={() => setMobDrop((v) => !v)}
                aria-expanded={mobDrop}
                className={`flex w-full items-center gap-3 py-5 text-2xl font-semibold tracking-tight ${parceriasActive || mobDrop ? "text-black" : "text-black/50"}`}
              >
                <Users size={22} strokeWidth={1.8} />
                Parcerias
                <ChevronDown size={20} strokeWidth={1.8} className={`ml-auto transition-transform duration-300 ${mobDrop ? "rotate-180" : ""}`} />
              </button>

              {mobDrop && (
                <div className="flex flex-col gap-1 pb-4">
                  {parcerias.map(({ label, href, icon: Icon, desc }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenu(false)}
                      className="flex gap-3 rounded-xl p-3 active:bg-black/5"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-black/5">
                        <Icon size={18} strokeWidth={1.8} />
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-base font-semibold">{label}</span>
                        <span className="truncate text-sm text-black/55">{desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
