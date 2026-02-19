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
                MAKRO TERMINAL
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
                href="/quiz"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#222] text-white font-bold hover:bg-[#333] transition-colors border-2 border-[#444]"
              >
                <Gamepad2 className="mr-2 w-5 h-5" />
                Ta en quiz
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Innhold
          </h2>
          <p className="text-lg text-[#aaa] max-w-2xl mx-auto">
            En komplett plattform for å holde deg oppdatert på finansmarkedene
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-[#111] border-2 border-[#333] p-8 hover:border-[#ff6b35] transition-colors">
            <div className="w-14 h-14 bg-[#ff6b35]/20 border border-[#ff6b35] flex items-center justify-center mb-6">
              <Newspaper className="w-7 h-7 text-[#ff6b35]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Nyheter 
            </h3>
            <p className="text-[#aaa]">
              Samlet nyheter basert på sentiment AI fetching, web scraping, og API kilder
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#111] border-2 border-[#333] p-8 hover:border-[#00d084] transition-colors">
            <div className="w-14 h-14 bg-[#00d084]/20 border border-[#00d084] flex items-center justify-center mb-6">
              <BarChart3 className="w-7 h-7 text-[#00d084]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Makro oppsummering
            </h3>
            <p className="text-[#aaa]">
              Få en strukturert oversikt over siste periode. Gruppert etter tema.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#111] border-2 border-[#333] p-8 hover:border-[#4dabf7] transition-colors">
            <div className="w-14 h-14 bg-[#4dabf7]/20 border border-[#4dabf7] flex items-center justify-center mb-6">
              <Gamepad2 className="w-7 h-7 text-[#4dabf7]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Lær med quiz
            </h3>
            <p className="text-[#aaa]">
              Kahoot-inspirerte quizer basert på faktiske nyheter. Lættis læring!
            </p>
          </div>
        </div>
      </div>


    
      {/* Footer */}
      <footer className="bg-black border-t border-[#333] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold text-white">MAKRO TERMINAL</span>
              <p className="text-sm text-[#666] mt-1">MVP - bygget for makro uke 9 2026</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/dashboard" className="text-[#aaa] hover:text-[#ff6b35] transition-colors">
                Nyheter
              </Link>
              <Link href="/summary" className="text-[#aaa] hover:text-[#ff6b35] transition-colors">
                Oppsummering
              </Link>
              <Link href="/quiz" className="text-[#aaa] hover:text-[#ff6b35] transition-colors">
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
