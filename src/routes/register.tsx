import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { calculateAge, getCategory, COMPETITIONS } from "@/lib/registration-utils";
import { User, MapPin, Church, Trophy, CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Full name required").max(120),
  father_name: z.string().trim().max(120).optional().or(z.literal("")),
  gender: z.enum(["Male", "Female"]).optional(),
  date_of_birth: z.string().min(1, "DOB required"),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
  whatsapp: z.string().regex(/^\d{10}$/).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  district: z.string().max(80).optional().or(z.literal("")),
  state: z.string().max(80).optional().or(z.literal("")),
  pincode: z.string().max(10).optional().or(z.literal("")),
  church_name: z.string().trim().min(2, "Church name required").max(150),
  pastor_name: z.string().max(120).optional().or(z.literal("")),
  church_location: z.string().max(150).optional().or(z.literal("")),
});

type FormState = {
  full_name: string; father_name: string; gender: "Male" | "Female" | "";
  date_of_birth: string; mobile: string; whatsapp: string; email: string;
  address: string; district: string; state: string; pincode: string;
  church_name: string; pastor_name: string; church_location: string;
};

const initial: FormState = {
  full_name: "", father_name: "", gender: "", date_of_birth: "",
  mobile: "", whatsapp: "", email: "", address: "", district: "", state: "", pincode: "",
  church_name: "", pastor_name: "", church_location: "",
};

function SectionCard({ icon: Icon, title, step, children }: { icon: React.ComponentType<{ className?: string }>; title: string; step: number; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gold">Section {step}</div>
          <h3 className="font-display text-lg font-bold">{title}</h3>
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initial);
  const [competitions, setCompetitions] = useState<string[]>([]);
  const [bibleLang, setBibleLang] = useState<"Tamil" | "English">("Tamil");
  const [pptLang, setPptLang] = useState<"Tamil" | "English">("Tamil");
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const age = useMemo(() => calculateAge(form.date_of_birth), [form.date_of_birth]);
  const category = useMemo(() => getCategory(age), [age]);

  const { data: isOpen, isLoading: statusLoading } = useQuery({
    queryKey: ["reg-status"],
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "registration_open").maybeSingle();
      return (data?.value as boolean) ?? true;
    },
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const toggleComp = (id: string) => {
    setCompetitions((c) => c.includes(id) ? c.filter((x) => x !== id) : [...c, id]);
  };

  // Progress
  const progress = useMemo(() => {
    let filled = 0; const total = 6;
    if (form.full_name && form.date_of_birth && form.mobile.length === 10) filled++;
    if (form.address || form.district || form.state) filled++;
    if (form.church_name) filled++;
    if (competitions.length > 0) filled++;
    if (category) filled++;
    if (confirmed) filled++;
    return Math.round((filled / total) * 100);
  }, [form, competitions, category, confirmed]);

  const canSubmit = competitions.length > 0 && confirmed && !submitting && isOpen !== false;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { fe[i.path.join(".")] = i.message; });
      setErrors(fe);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    setSubmitting(true);

    // Generate a client-side registration ID so we don't need .select() after insert.
    // This avoids the RLS violation: anon users can INSERT but NOT SELECT.
    const timestamp = Date.now().toString().slice(-6);
    const rand = Math.floor(100 + Math.random() * 900).toString();
    const clientRegId = `PEACE2026-${timestamp}${rand}`;

    const payload = {
      registration_id: clientRegId,
      full_name: form.full_name.trim(),
      father_name: form.father_name.trim() || null,
      gender: form.gender || null,
      date_of_birth: form.date_of_birth,
      age,
      category,
      mobile: form.mobile,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      address: form.address || null,
      district: form.district || null,
      state: form.state || null,
      pincode: form.pincode || null,
      church_name: form.church_name.trim(),
      pastor_name: form.pastor_name || null,
      church_location: form.church_location || null,
      competitions,
      bible_test_language: competitions.includes("bible_test") ? bibleLang : null,
      ppt_language: competitions.includes("ppt") ? pptLang : null,
    };

    // Insert WITHOUT .select() — avoids the RLS SELECT policy violation for anon users
    const { error } = await supabase.from("registrations").insert(payload as never);
    setSubmitting(false);

    if (error) {
      if (error.code === "23505" || error.message.toLowerCase().includes("mobile") || error.message.toLowerCase().includes("duplicate")) {
        toast.error("This mobile number is already registered.");
      } else {
        toast.error(error.message || "Something went wrong. Please try again.");
      }
      return;
    }

    toast.success("Registration successful!");
    // Store the submitted data locally — no DB read needed
    const regData = {
      registration_id: clientRegId,
      full_name: form.full_name.trim(),
      competitions,
      category,
    };
    sessionStorage.setItem("peace_last_reg", JSON.stringify(regData));
    navigate({ to: "/success" });
  };

  if (statusLoading) {
    return <div className="min-h-screen bg-background"><Header /><div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div>;
  }

  if (isOpen === false) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4">
          <div className="glass-card w-full rounded-2xl p-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-3xl">🔒</div>
            <h1 className="mt-6 font-display text-2xl font-bold">Registration Closed</h1>
            <p className="mt-2 text-sm text-muted-foreground">Registration for PEACE 2026 is currently closed. Please check back later or contact the organizers.</p>
            <Link to="/" className="mt-6 inline-flex rounded-full btn-hero px-6 py-2.5 text-sm font-semibold">Back to Home</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Progress bar */}
      <div className="sticky top-16 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-primary">Registration Form</span>
            <span className="text-muted-foreground">{progress}% complete</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold sm:text-4xl text-gradient">Register for PEACE 2026</h1>
          <p className="mt-2 text-sm text-muted-foreground">Fill in your details below. Fields marked * are required.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Section 1 */}
          <SectionCard icon={User} step={1} title="Personal Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" required error={errors.full_name}>
                <input className={inputCls} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} maxLength={120} />
              </Field>
              <Field label="Father's Name">
                <input className={inputCls} value={form.father_name} onChange={(e) => set("father_name", e.target.value)} maxLength={120} />
              </Field>
              <Field label="Gender">
                <div className="flex gap-3">
                  {(["Male", "Female"] as const).map((g) => (
                    <label key={g} className={`flex-1 cursor-pointer rounded-xl border px-4 py-2.5 text-center text-sm transition ${form.gender === g ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border bg-background hover:border-primary/40"}`}>
                      <input type="radio" name="gender" className="sr-only" checked={form.gender === g} onChange={() => set("gender", g)} />
                      {g}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Date of Birth" required error={errors.date_of_birth}>
                <input type="date" className={inputCls} value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} max={new Date().toISOString().split("T")[0]} />
              </Field>
              <Field label="Age">
                <input className={inputCls + " bg-muted"} value={age > 0 ? age : ""} readOnly placeholder="Auto-calculated" />
              </Field>
              <Field label="Mobile Number" required error={errors.mobile}>
                <input inputMode="numeric" className={inputCls} value={form.mobile} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" />
              </Field>
              <Field label="WhatsApp Number" error={errors.whatsapp}>
                <input inputMode="numeric" className={inputCls} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Optional" />
              </Field>
              <Field label="Email Address" error={errors.email}>
                <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={255} />
              </Field>
            </div>

            {category && (
              <div className="mt-5 rounded-xl border border-gold/40 bg-gold/10 p-4 shadow-[var(--shadow-gold)]">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-gold-foreground/70">Your Category</div>
                <div className="mt-0.5 font-display text-2xl font-bold text-primary">{category}</div>
                <div className="text-xs text-muted-foreground">Based on age {age}</div>
              </div>
            )}
          </SectionCard>

          {/* Section 2 */}
          <SectionCard icon={MapPin} step={2} title="Address">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Address"><textarea className={inputCls} rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} maxLength={300} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="District"><input className={inputCls} value={form.district} onChange={(e) => set("district", e.target.value)} maxLength={80} /></Field>
                <Field label="State"><input className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)} maxLength={80} /></Field>
                <Field label="Pincode"><input inputMode="numeric" className={inputCls} value={form.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 10))} /></Field>
              </div>
            </div>
          </SectionCard>

          {/* Section 3 */}
          <SectionCard icon={Church} step={3} title="Church Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Church Name" required error={errors.church_name}>
                <input className={inputCls} value={form.church_name} onChange={(e) => set("church_name", e.target.value)} maxLength={150} />
              </Field>
              <Field label="Pastor Name"><input className={inputCls} value={form.pastor_name} onChange={(e) => set("pastor_name", e.target.value)} maxLength={120} /></Field>
              <Field label="Church Location"><input className={inputCls} value={form.church_location} onChange={(e) => set("church_location", e.target.value)} maxLength={150} /></Field>
            </div>
          </SectionCard>

          {/* Section 4 — Rules and selection */}
          <SectionCard icon={Trophy} step={4} title="Competitions & Rules">
            <p className="mb-5 text-sm text-muted-foreground">Read the rules for each event below and tick the ones you want to enter.</p>

            <div className="space-y-5">
              {COMPETITIONS.map((c) => {
                const checked = competitions.includes(c.id);
                return (
                  <div key={c.id} className={`overflow-hidden rounded-2xl border transition ${checked ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]" : "border-border bg-background"}`}>
                    {/* Rules header */}
                    <div className="border-b border-border/60 bg-[image:var(--gradient-soft)] p-5">
                      <div className="flex items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-2xl shadow-[var(--shadow-soft)]">{c.emoji}</div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display text-base font-bold text-primary sm:text-lg">{c.label}</h4>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>📅 {c.date} ({c.day})</span>
                            <span>⏰ {c.time}</span>
                            {c.lastDate && <span className="font-semibold text-destructive">Last date: {c.lastDate}</span>}
                          </div>
                        </div>
                      </div>

                      {c.topic && (
                        <div className="mt-4 rounded-lg border border-gold/40 bg-gold/10 p-3">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-gold-foreground/70">Topic</div>
                          <div className="font-display text-sm font-bold text-primary">{c.topic}</div>
                        </div>
                      )}

                      {c.portions && (
                        <div className="mt-4">
                          <div className="text-xs font-semibold text-foreground">Bible Portions</div>
                          <ul className="mt-1.5 flex flex-wrap gap-1.5">
                            {c.portions.map((p) => (
                              <li key={p} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs text-primary">{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {c.subtopics && (
                        <div className="mt-4">
                          <div className="text-xs font-semibold text-foreground">Suggested Presentation Points</div>
                          <ul className="mt-1.5 grid grid-cols-1 gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                            {c.subtopics.map((s) => (
                              <li key={s} className="flex items-start gap-1.5"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gold" />{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {c.categories && (
                        <div className="mt-4">
                          <div className="text-xs font-semibold text-foreground">Categories & Bible Portions</div>
                          <div className="mt-1.5 divide-y divide-border/60 overflow-hidden rounded-lg border border-border/60 bg-white">
                            {c.categories.map((cat) => (
                              <div key={cat.name} className="grid grid-cols-1 gap-1 p-2.5 text-xs sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] sm:gap-3">
                                <span className="font-semibold text-primary">{cat.name}</span>
                                <span className="text-muted-foreground">{cat.portion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <div className="text-xs font-semibold text-foreground">Rules</div>
                        <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                          {c.rules.map((r) => (
                            <li key={r} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Select checkbox */}
                    <label className="flex cursor-pointer items-center gap-3 p-4">
                      <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleComp(c.id)} />
                      <div className={`grid h-6 w-6 place-items-center rounded-md border-2 transition ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                        {checked && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      <span className={`text-sm font-semibold ${checked ? "text-primary" : "text-foreground"}`}>
                        {checked ? `Selected — ${c.label}` : `Select ${c.label}`}
                      </span>
                    </label>

                    {/* Language selectors */}
                    {checked && c.id === "bible_test" && (
                      <div className="border-t border-border/60 bg-white p-4">
                        <div className="mb-2 text-xs font-semibold text-primary">Preferred Language for Bible Written Test</div>
                        <div className="flex gap-3">
                          {(["Tamil", "English"] as const).map((l) => (
                            <label key={l} className={`flex-1 cursor-pointer rounded-lg border px-4 py-2 text-center text-sm transition ${bibleLang === l ? "border-primary bg-primary text-primary-foreground font-semibold" : "border-border bg-background"}`}>
                              <input type="radio" name="bibleLang" className="sr-only" checked={bibleLang === l} onChange={() => setBibleLang(l)} />
                              {l}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    {checked && c.id === "ppt" && (
                      <div className="border-t border-border/60 bg-white p-4">
                        <div className="mb-2 text-xs font-semibold text-primary">Presentation Language</div>
                        <div className="flex gap-3">
                          {(["Tamil", "English"] as const).map((l) => (
                            <label key={l} className={`flex-1 cursor-pointer rounded-lg border px-4 py-2 text-center text-sm transition ${pptLang === l ? "border-primary bg-primary text-primary-foreground font-semibold" : "border-border bg-background"}`}>
                              <input type="radio" name="pptLang" className="sr-only" checked={pptLang === l} onChange={() => setPptLang(l)} />
                              {l}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {competitions.length === 0 && (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-xs text-destructive">
                Please select at least one competition to continue.
              </div>
            )}
          </SectionCard>


          {/* Declaration */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 h-5 w-5 accent-[var(--primary)]" />
              <span className="text-sm text-foreground">I confirm that all the information provided is correct.</span>
            </label>
          </div>

          <div className="flex justify-center pb-8">
            <button type="submit" disabled={!canSubmit} className="inline-flex items-center gap-2 rounded-full btn-hero px-10 py-3.5 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
              {submitting ? (<><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</>) : "Submit Registration"}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
