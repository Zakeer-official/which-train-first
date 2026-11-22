import { ShieldCheck, Database, GitBranch } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface/50 mt-16 py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="font-semibold text-slate-200 mb-2 flex items-center space-x-2">
              <span>Which Train First Intelligence</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rail-leader animate-pulse"></span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Inspired by Where Is My Train — Real-time Indian Railways dual-train comparison platform. Predicting destination arrivals using multi-level telemetry, track sequence algorithms, and live running delay propagation.
            </p>
          </div>
          <div>
            <div className="font-semibold text-slate-200 mb-2 flex items-center space-x-2">
              <Database className="w-4 h-4 text-rail-cyan" />
              <span>Multi-Source Architecture</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Provider-independent integration supporting official NTES feeds, RapidAPI adapters, and simulated testing suites with strict accuracy disclosures.
            </p>
          </div>
          <div>
            <div className="font-semibold text-slate-200 mb-2 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-rail-leader" />
              <span>Safety & Transparency</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              This application is an independent passenger intelligence tool and is not an official Indian Railways reservation portal.
            </p>
          </div>
        </div>
        <div className="pt-6 border-t border-surface-border/50 flex flex-col sm:flex-row justify-between items-center text-slate-500">
          <p>© {new Date().getFullYear()} Train Race Platform. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 text-[11px]">
            <span>FastAPI + Next.js App Router</span>
            <span>•</span>
            <span>PostgreSQL & SQLite</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
