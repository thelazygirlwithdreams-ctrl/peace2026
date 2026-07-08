import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, ArrowRight, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { COMPETITIONS } from "@/lib/registration-utils";

// Import local images directly
import bannerImg from "@/assets/banner.png";
import mobBannerImg from "@/assets/mob_banner.png";

export const Route = createFileRoute("/")(
  {
  component: Home,
});

function useRegistrationStatus() {
  return useQuery({
    queryKey: ["reg-status"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "registration_open").maybeSingle();
      return (data?.value as boolean) ?? true;
    },
  });
}

function Home() {
  const { data: isOpen = true } = useRegistrationStatus();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ══════════════════════════════════════════════════════════
          HERO — Pure banner image, no text overlay
          Desktop: banner.png | Mobile: mob_banner.png
          ══════════════════════════════════════════════════════════ */}
      <section className="relative w-full">
        {/* Desktop banner (hidden on mobile) */}
        <img
          src={bannerImg}
          alt="PEACE 2026 — Advent Christian Church"
          className="hidden sm:block w-full h-auto object-cover"
          fetchPriority="high"
        />
        {/* Mobile banner (hidden on desktop) */}
        <img
          src={mobBannerImg}
          alt="PEACE 2026 — Advent Christian Church"
          className="block sm:hidden w-full h-auto object-cover"
          fetchPriority="high"
        />

        {/* Minimal CTA buttons overlaid at bottom */}
        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex items-center justify-center gap-3 sm:gap-4 px-4">
          {isOpen ? (
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(251,191,36,0.5)]"
            >
              Register Now <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/20 px-6 py-3 text-sm font-bold text-white backdrop-blur">
              Registration Closed
            </div>
          )}
          <a
            href="#events"
            className="inline-flex items-center justify-center rounded-full border border-white/50 bg-black/30 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white backdrop-blur transition hover:bg-black/50"
          >
            View Events
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          VERSE STRIP
          ══════════════════════════════════════════════════════════ */}
      <div className="border-y border-amber-200/40 bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-950">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4 py-5 text-center sm:px-6">
          <p className="font-display text-xs italic text-amber-200/90 sm:text-sm">
            "Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          EVENTS SECTION
          ══════════════════════════════════════════════════════════ */}
      <section id="events" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600">The Events</div>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl text-gradient">Choose Your Competition</h2>
          <p className="mt-3 text-muted-foreground">Three events. One inspiring weekend. Open to all churches.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {COMPETITIONS.map((e) => (
            <div
              key={e.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-amber-400/10 blur-2xl transition-opacity group-hover:opacity-80" />
              <div className="relative">
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-2xl shadow-[var(--shadow-soft)]">
                  {e.emoji}
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{e.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground min-h-[3rem]">{e.short}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-primary" /> {e.date} ({e.day})</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> {e.time}</span>
                </div>
                <Link
                  to="/register"
                  className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full btn-hero px-5 py-2.5 text-sm font-semibold"
                >
                  Register <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          VENUE SECTION
          ══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-bold">Venue</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Advent Christian Church, ECR, Thiruvanmiyur, Chennai, Tamil Nadu, India.
          </p>
        </div>
      </section>

      <Footer />

      {/* Mobile sticky CTA */}
      {isOpen && (
        <Link
          to="/register"
          className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full btn-hero px-7 py-3 text-sm font-bold shadow-[var(--shadow-elegant)] md:hidden whitespace-nowrap"
        >
          Register Now
        </Link>
      )}
    </div>
  );
}
