import ReferralForm from "./ReferralForm";

export default function ReferralSection() {
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <h2 className="mb-5 max-w-[14ch] text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.05] tracking-tight">
          Faça sua indicação
        </h2>
        <p className="max-w-[32ch] font-light leading-relaxed text-[var(--muted)]">
          Só o essencial já ajuda.
        </p>

        {/* poleiros do mascote (só desktop): ele voa entre os dois e olha para o campo em foco */}
        <div data-mascot-dock className="mt-16 hidden h-40 w-full justify-between lg:flex" aria-hidden>
          <span data-mascot-perch="0" className="h-40 w-40" />
          <span data-mascot-perch="1" className="h-40 w-40" />
        </div>
      </aside>

      <ReferralForm />
    </div>
  );
}
