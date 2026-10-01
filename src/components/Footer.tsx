// components/Footer.tsx
import Link from "next/link";
import { Logo } from "./Logo";

const WHATSAPP_URL = "https://wa.me/5500000000000"; // TODO: trocar pelo número real

const company = [
  { label: "Início", href: "/" },
  { label: "Cases", href: "/cases" },
  { label: "Parcerias", href: "/parcerias" },
];

const legal = [
  { label: "Termos de Uso", href: "/termos" },
  { label: "Política de Privacidade", href: "/privacidade" },
  { label: "Cookies", href: "/cookies" },
];

const socials = [
  {
    label: "Instagram",
    href: "https://instagram.com/", // TODO: trocar pelo perfil real
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/", // TODO: trocar pelo canal real
    icon: (
      <>
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/", // TODO: trocar pela página real
    icon: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
];

/** "Orelha" do topo: trecho do canto do Subtract.svg */
function Ear({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 104 27"
      aria-hidden="true"
      className={`absolute top-0 h-[27px] w-[104px] ${
        flip ? "right-0 -scale-x-100" : "left-0"
      }`}
      fill="black"
    >
      {/* o 27 (em vez de 26) sobrepõe 1px no corpo para não aparecer fresta */}
      <path d="M0 0H52.8127C56.8433 0 60.7799 1.21783 64.1064 3.49385L91.8936 22.5061C95.2201 24.7822 99.1567 26 103.187 26H104V27H0Z" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <path
        d="M4.5 11.5L11.5 4.5M5.5 4.5H11.5V10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CtaButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-medium text-black transition hover:bg-white/90 ${className}`}
    >
      Começar Projeto
      <ArrowUpRight />
    </a>
  );
}

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h3 className="mb-3 text-xs font-semibold text-white">{title}</h3>
      <ul className="space-y-1.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-xs text-white/70 transition hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SocialLinks() {
  return (
    <ul className="mt-6 flex items-center gap-2">
      {socials.map(({ label, href, icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {icon}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    // pt-[26px] (e não mt no filho) evita o margin collapse que achatava a curva
    <footer id="footer" className="relative pt-[26px] text-white">
      {/* Orelhas coladas nas laterais (cantos arredondados ficam fora da tela) */}
      <Ear />
      <Ear flip />

      <div className="bg-black">
        {/* mesmo padding horizontal da Hero, sem max-w */}
        <div className="w-full px-6 pt-20 pb-24 md:px-10 md:pt-28 md:pb-36">
          {/* CTA */}
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-4xl font-medium tracking-tight md:text-6xl">
                Pronto pra começar?
              </h2>
              <p className="mt-3 max-w-md text-sm text-white/70">
                Chama no WhatsApp. A gente responde rápido e já entende o que seu
                projeto precisa.
              </p>
            </div>
            <CtaButton className="w-full md:w-auto" />
          </div>

          <hr className="my-12 border-white/15 md:my-16" />

          {/* Marca + links */}
          <div className="grid gap-12 md:grid-cols-[36fr_44fr_20fr]">
            <div>
              <Link
                href="/"
                aria-label="Início"
                className="mb-5 block h-10 w-10 text-white md:h-12 md:w-12"
              >
                <Logo className="h-full w-full" />
              </Link>
              <p className="max-w-[24rem] text-xs leading-relaxed text-white/60">
                Profissionais prontos para criar o melhor projeto que você já teve.
                Do UX à segurança, sob um mesmo time.
              </p>

              <SocialLinks />
            </div>

            <div className="grid grid-cols-2 gap-8 md:contents">
              <LinkColumn title="Empresa" links={company} />
              <LinkColumn title="Legal" links={legal} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}