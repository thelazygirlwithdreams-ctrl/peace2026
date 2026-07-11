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
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0c2461 0%, #1a3a8f 40%, #0c2461 100%)" }}>
        {/* Subtle shimmer line */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #f5a623, transparent)" }} />
        </div>
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4 py-5 text-center sm:px-6">
          <p className="font-display text-xs italic sm:text-sm" style={{ color: "#fde68a" }}>
            ✦ &nbsp;"Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105&nbsp; ✦
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          EVENTS SECTION — Banner-matched deep blue + gold theme
          ══════════════════════════════════════════════════════════ */}
      <section
        id="events"
        className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24"
        style={{ background: "linear-gradient(160deg, #07184a 0%, #0d2b80 35%, #112fa8 60%, #0a1e6e 100%)" }}
      >
        {/* Background orb glows */}
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(circle, #f5a623, transparent)" }} />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #facc15, transparent)" }} />

        <div className="relative mx-auto max-w-7xl">
          {/* Section header */}
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ borderColor: "#f5a623", color: "#f5a623", background: "rgba(245,166,35,0.08)" }}>
              ✦ The Events ✦
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
              Choose Your <span style={{ color: "#f5a623" }}>Competition</span>
            </h2>
            <p className="mt-3 text-sm" style={{ color: "#bfdbfe" }}>Three events. One inspiring weekend. Open to all churches.</p>
          </div>

          {/* Event cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {COMPETITIONS.map((e) => (
              <div
                key={e.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(245,166,35,0.30)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                {/* Gold top accent bar */}
                <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, transparent, #f5a623, transparent)" }} />

                {/* Hover glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(ellipse at top right, rgba(245,166,35,0.12), transparent 60%)" }} />

                <div className="relative flex flex-1 flex-col p-6">
                  {/* Icon */}
                  <div
                    className="grid h-14 w-14 place-items-center rounded-xl text-2xl shadow-lg"
                    style={{ background: "linear-gradient(135deg, #f5a623, #fbbf24)", boxShadow: "0 4px 20px rgba(245,166,35,0.4)" }}
                  >
                    {e.emoji}
                  </div>

                  {/* Title */}
                  <h3 className="mt-5 font-display text-lg font-bold text-white sm:text-xl">{e.label}</h3>

                  {/* Short description */}
                  <p className="mt-2 text-sm min-h-[3rem]" style={{ color: "#93c5fd" }}>{e.short}</p>

                  {/* Date & time chips */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                      style={{ background: "rgba(255,255,255,0.08)", color: "#bfdbfe", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      <Calendar className="h-3.5 w-3.5" style={{ color: "#f5a623" }} />
                      {e.date} ({e.day})
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                      style={{ background: "rgba(255,255,255,0.08)", color: "#bfdbfe", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      <Clock className="h-3.5 w-3.5" style={{ color: "#f5a623" }} />
                      {e.time}
                    </span>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Register button */}
                  <Link
                    to="/register"
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-gray-900 transition-all duration-200 hover:brightness-110 hover:shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #f5a623, #fbbf24)",
                      boxShadow: "0 4px 18px rgba(245,166,35,0.40)",
                    }}
                  >
                    Register <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          VENUE SECTION — Banner-matched
          ══════════════════════════════════════════════════════════ */}
      <section className="px-4 pb-16 sm:px-6" style={{ background: "#07184a" }}>
        <div className="mx-auto max-w-5xl">
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
              border: "1px solid rgba(245,166,35,0.25)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <MapPin className="h-5 w-5" style={{ color: "#f5a623" }} />
              <h3 className="font-display text-lg font-bold text-white">Venue</h3>
            </div>
            <p className="mt-2 text-sm" style={{ color: "#93c5fd" }}>
              Advent Christian Church, ECR, Thiruvanmiyur, Chennai, Tamil Nadu, India.
            </p>
          </div>
        </div>
      </section>


      <Footer />


    </div>
  );
}
