import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  BookOpen, Monitor, HelpCircle, Users, Calendar, Download, Search, LogOut,
  Loader2, Lock, Unlock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

type Registration = {
  id: string; registration_id: string; full_name: string; father_name: string | null;
  gender: string | null; date_of_birth: string; age: number; category: string;
  mobile: string; whatsapp: string | null; email: string | null;
  address: string | null; district: string | null; state: string | null; pincode: string | null;
  church_name: string; pastor_name: string | null; church_location: string | null;
  competitions: string[]; bible_test_language: string | null; ppt_language: string | null;
  status: string; created_at: string;
};

const COMP_SHORT: Record<string, string> = { bible_test: "Bible Test", ppt: "PPT", quiz: "Quiz" };

function AdminDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate({ to: "/admin/login" }); return; }
      setUserEmail(sess.session.user.email || "");
      // Try to claim admin (no-op if already exists)
      await supabase.rpc("claim_first_admin" as never);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", sess.session.user.id);
      const ok = (roles || []).some((r) => r.role === "admin");
      setIsAdmin(ok);
      setReady(true);
    })();
  }, [navigate]);

  const regsQ = useQuery({
    queryKey: ["admin-regs"],
    enabled: ready && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Registration[];
    },
  });

  const statusQ = useQuery({
    queryKey: ["reg-status"],
    enabled: ready && isAdmin,
    queryFn: async () => {
      const { data } = await supabase.from("app_settings").select("value").eq("key", "registration_open").maybeSingle();
      return (data?.value as boolean) ?? true;
    },
  });

  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!regsQ.data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return regsQ.data;
    return regsQ.data.filter((r) => {
      return [r.full_name, r.mobile, r.church_name, r.pastor_name, r.church_location, r.category, ...r.competitions.map((c) => COMP_SHORT[c] || c)]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [regsQ.data, search]);

  const stats = useMemo(() => {
    const list = regsQ.data || [];
    const todayStr = new Date().toISOString().slice(0, 10);
    return {
      total: list.length,
      bible: list.filter((r) => r.competitions.includes("bible_test")).length,
      ppt: list.filter((r) => r.competitions.includes("ppt")).length,
      quiz: list.filter((r) => r.competitions.includes("quiz")).length,
      today: list.filter((r) => r.created_at.slice(0, 10) === todayStr).length,
    };
  }, [regsQ.data]);

  const toggleRegistration = async () => {
    const newVal = !(statusQ.data ?? true);
    const { error } = await supabase.from("app_settings").update({ value: newVal as never, updated_at: new Date().toISOString() }).eq("key", "registration_open");
    if (error) { toast.error(error.message); return; }
    toast.success(newVal ? "Registration opened" : "Registration closed");
    qc.invalidateQueries({ queryKey: ["reg-status"] });
  };

  const exportExcel = () => {
    const rows = (regsQ.data || []).map((r) => ({
      "Registration ID": r.registration_id,
      "Name": r.full_name,
      "Mobile": r.mobile,
      "Email": r.email || "",
      "Advent Branch": r.church_name,
      "Pastor Name": r.father_name || "",
      "Youth Leader": r.pastor_name || "",
      "Youth Leader Contact": r.church_location || "",
      "Category": r.category,
      "Bible Test": r.competitions.includes("bible_test") ? "Yes" : "",
      "PPT": r.competitions.includes("ppt") ? "Yes" : "",
      "Bible Quiz": r.competitions.includes("quiz") ? "Yes" : "",
      "Registration Date": new Date(r.created_at).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, `PEACE2026-Registrations-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  if (!ready) return <div className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="glass-card max-w-md rounded-2xl p-10 text-center">
          <h1 className="font-display text-xl font-bold">Access Denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your account does not have admin privileges.</p>
          <button onClick={signOut} className="mt-6 rounded-full btn-hero px-5 py-2 text-sm font-semibold">Sign out</button>
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total Registrations", value: stats.total, icon: Users, color: "text-primary" },
    { label: "Bible Test", value: stats.bible, icon: BookOpen, color: "text-primary" },
    { label: "PPT", value: stats.ppt, icon: Monitor, color: "text-primary" },
    { label: "Bible Quiz", value: stats.quiz, icon: HelpCircle, color: "text-primary" },
    { label: "Today", value: stats.today, icon: Calendar, color: "text-gold-foreground" },
  ];

  return (
    <div className="min-h-screen bg-[image:var(--gradient-soft)]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-display text-lg font-bold text-primary">PEACE 2026</Link>
            <span className="hidden text-xs text-muted-foreground sm:inline">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">{userEmail}</span>
            <button onClick={signOut} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-secondary">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Registration status */}
        <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Registration Status</div>
            <div className="mt-0.5 flex items-center gap-2">
              {statusQ.data ? (
                <><Unlock className="h-4 w-4 text-primary" /><span className="font-display text-lg font-bold text-primary">Open</span></>
              ) : (
                <><Lock className="h-4 w-4 text-destructive" /><span className="font-display text-lg font-bold text-destructive">Closed</span></>
              )}
            </div>
          </div>
          <button onClick={toggleRegistration} className="rounded-full btn-hero px-5 py-2 text-xs font-semibold">
            {statusQ.data ? "Close Registration" : "Open Registration"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground">{c.label}</div>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <div className="mt-2 font-display text-3xl font-extrabold text-foreground">{c.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="mt-8 rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-bold">Participants</h2>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, branch, leader…" className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-80" />
              </div>
              <button onClick={exportExcel} className="inline-flex items-center justify-center gap-1.5 rounded-full btn-hero px-4 py-2 text-xs font-semibold">
                <Download className="h-4 w-4" /> Export Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {regsQ.isLoading ? (
              <div className="grid place-items-center p-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">No registrations found.</div>
            ) : (
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    {["Reg ID", "Name", "Mobile", "Advent Branch", "Pastor", "Youth Leader", "Category", "Competitions", "Date", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{r.registration_id}</td>
                      <td className="px-4 py-3 font-medium">{r.full_name}</td>
                      <td className="px-4 py-3">{r.mobile}</td>
                      <td className="px-4 py-3">{r.church_name}</td>
                      <td className="px-4 py-3">{r.father_name || "—"}</td>
                      <td className="px-4 py-3">{r.pastor_name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold-foreground">{r.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.competitions.map((c) => (
                            <span key={c} className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{COMP_SHORT[c] || c}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
