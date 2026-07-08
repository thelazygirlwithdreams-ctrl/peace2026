import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Home, Trophy } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/success")({
  component: SuccessPage,
});

type Reg = { registration_id: string; full_name: string; competitions: string[]; category: string };

const COMP_LABELS: Record<string, string> = {
  bible_test: "Bible Written Test",
  ppt: "PowerPoint Presentation Competition",
  quiz: "Bible Quiz",
};

function SuccessPage() {
  const navigate = useNavigate();
  const [reg, setReg] = useState<Reg | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("peace_last_reg");
    if (!raw) { navigate({ to: "/" }); return; }
    try { setReg(JSON.parse(raw)); } catch { navigate({ to: "/" }); }
  }, [navigate]);

  if (!reg) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-elegant)] sm:p-12">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative text-center">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[image:var(--gradient-primary)] shadow-[var(--shadow-elegant)] animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="h-14 w-14 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold text-gradient sm:text-4xl">Registration Successful</h1>
            <p className="mt-2 text-muted-foreground">Thank you for registering for PEACE 2026!</p>

            <div className="mt-8 rounded-2xl border border-gold/40 bg-gold/10 p-5 text-left shadow-[var(--shadow-gold)]">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-gold-foreground/70">Registration Number</div>
              <div className="mt-1 font-display text-2xl font-extrabold tracking-wider text-primary sm:text-3xl">{reg.registration_id}</div>
            </div>

            <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Participant</div>
                <div className="mt-0.5 font-semibold text-foreground">{reg.full_name}</div>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Category</div>
                <div className="mt-0.5 font-semibold text-foreground">{reg.category}</div>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-4 sm:col-span-2">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Selected Competitions</div>
                <ul className="mt-2 space-y-1">
                  {reg.competitions.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Trophy className="h-4 w-4 text-gold" /> {COMP_LABELS[c] || c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">Please save your registration number for future reference. Bring it with you on the event day.</p>

            <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-full btn-hero px-8 py-3 text-sm font-semibold">
              <Home className="h-4 w-4" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
