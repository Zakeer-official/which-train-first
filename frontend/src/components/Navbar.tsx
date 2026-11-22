import Link from "next/link";
import { Zap, Activity, Compass, Info, Github } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-surface-border bg-surface/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rail-blue to-rail-cyan p-0.5 shadow-lg shadow-rail-cyan/20">
            <div className="w-full h-full bg-surface rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-rail-cyan group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                WHICH<span className="text-rail-cyan">TRAIN</span>FIRST
              </span>
              <span className="text-[10px] font-semibold bg-rail-cyan/10 text-rail-cyan border border-rail-cyan/30 px-1.5 py-0.5 rounded">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">
              Inspired by Where Is My Train • Dual ETA Engine
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <Link
            href="/create"
            className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-rail-cyan transition-colors"
          >
            <Compass className="w-4 h-4 text-rail-cyan" />
            <span>Start a Race</span>
          </Link>
          <Link
            href="/about"
            className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-rail-cyan transition-colors"
          >
            <Info className="w-4 h-4 text-slate-400" />
            <span>Data Sources</span>
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </nav>
  );
}
