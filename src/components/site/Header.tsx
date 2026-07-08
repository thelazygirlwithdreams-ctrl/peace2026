import { Link } from "@tanstack/react-router";
import logoImg from "@/assets/logo.jpg";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-gradient-to-r from-blue-950/95 via-indigo-950/95 to-blue-950/95 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md" />
            <img
              src={logoImg}
              alt="Advent Christian Church Logo"
              className="relative h-10 w-10 object-contain rounded-full drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
            />
          </div>
          <div className="leading-tight min-w-0">
            <div
              className="font-display text-base sm:text-lg font-extrabold truncate"
              style={{
                background: "linear-gradient(90deg, #ffffff, #f5d78e, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              PEACE 2026
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-amber-300/70 font-semibold truncate">Advent Christian Church</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-white/70 hover:text-amber-300 transition-colors">Home</Link>
          <a href="/#events" className="text-sm font-medium text-white/70 hover:text-amber-300 transition-colors">Events</a>
          <Link to="/register" className="text-sm font-medium text-white/70 hover:text-amber-300 transition-colors">Register</Link>
        </nav>

        <Link
          to="/register"
          className="inline-flex shrink-0 items-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-gray-900 shadow-[0_4px_15px_rgba(251,191,36,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(251,191,36,0.5)]"
        >
          Register
        </Link>
      </div>
    </header>
  );
}
