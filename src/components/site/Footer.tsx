import { MapPin, Phone } from "lucide-react";
import { CONTACT_NUMBERS } from "@/lib/registration-utils";
import logoImg from "@/assets/logo.jpg";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-gradient-to-br from-blue-950 via-indigo-950 to-blue-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-md" />
              <img src={logoImg} alt="ACC" className="relative h-14 w-14 object-contain rounded-full" />
            </div>
            <div>
              <div
                className="font-display text-xl font-extrabold"
                style={{
                  background: "linear-gradient(90deg, #ffffff, #f5d78e, #ffffff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                PEACE 2026
              </div>
              <p className="mt-2 text-sm text-white/60">
                Advent Christian Church<br />Thiruvanmiyur, Chennai
              </p>
              <p className="mt-1 text-xs italic text-amber-300/70">"Jesus is Coming"</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="font-semibold text-amber-300">Contact</div>
            <div className="flex items-start gap-2 text-white/60">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <span>ECR, Thiruvanmiyur, Chennai,<br />Tamil Nadu, India</span>
            </div>
            <div className="flex items-start gap-2 text-white/60">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                {CONTACT_NUMBERS.map((n) => (
                  <a key={n} href={`tel:+91${n}`} className="hover:text-amber-300 transition-colors">+91 {n}</a>
                ))}
              </div>
            </div>
          </div>

          <div className="text-sm">
            <div className="font-semibold text-amber-300">About</div>
            <p className="mt-2 text-white/60">
              Annual Bible competitions bringing together believers from all churches to grow in scripture, fellowship, and faith.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Advent Christian Church, Thiruvanmiyur. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
