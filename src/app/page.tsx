import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Newspaper, BarChart3, Gamepad2, ArrowRight, Terminal, TrendingUp, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative bg-black border-b border-[#333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Terminal className="w-12 h-12 text-[#ff6b35]" />
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                FONDET TERMINAL
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-[#aaa] mb-8 max-w-3xl mx-auto">
              Fondets sentrale hub for analyser. To The Moon🚀.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#ff6b35] text-black font-bold hover:bg-[#ff8555] transition-colors"
              >
                Utforsk nyheter
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/makrooppdatering"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#222] text-white font-bold hover:bg-[#333] transition-colors border-2 border-[#444]"
              >
                <Gamepad2 className="mr-2 w-5 h-5" />
                Makrooppdatering
              </Link>
            </div>
          </div>
        </div>
      </div> 

    
      {/* Footer */}
      <footer className="bg-black border-t border-[#333] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold text-white">FONDET TERMINAL</span>
              <p className="text-sm text-[#666] mt-1">MVP - bygget for makro uke 9 2026</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/dashboard" className="text-[#aaa] hover:text-[#ff6b35] transition-colors">
                Nyheter
              </Link>
              <Link href="/summary" className="text-[#aaa] hover:text-[#ff6b35] transition-colors">
                Oppsummering
              </Link>
              <Link href="/makrooppdatering" className="text-[#aaa] hover:text-[#ff6b35] transition-colors">
                Quiz
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#222] text-sm text-[#666] text-center">
            © 2026 Makrooppdatering. Laget av Tri og Kaja
          </div>
        </div>
      </footer>
    </div>
  );
}
