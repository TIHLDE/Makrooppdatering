import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Newspaper, BarChart3, Gamepad2, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Navigation />
      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Makro Oppdatering
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
                Din sentrale hub for finansnyheter. Aksjer, fond, krypto og makroøkonomi - alt på ett sted.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Utforsk nyheter
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/quiz"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors border border-primary-500"
                >
                  <Gamepad2 className="mr-2 w-5 h-5" />
                  Ta en quiz
                </Link>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hva får du?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              En komplett plattform for å holde deg oppdatert på finansmarkedene - på en morsom måte!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Newspaper className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Kuraterte nyheter
              </h3>
              <p className="text-gray-600">
                Samlet fra pålitelige kilder. Filtrer etter sektor, verdipapirtype, land og mer. 
                Du bestemmer hva som er relevant.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Makro oppsummering
              </h3>
              <p className="text-gray-600">
                Få en strukturert oversikt over siste periode. Gruppert etter tema - 
                inflasjon, renter, energi, geopolitikk og mer.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Gamepad2 className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Lær med quiz
              </h3>
              <p className="text-gray-600">
                Kahoot-inspirerte quizer basert på faktiske nyheter. 
                "Lættis læring" - seriøst innhold, lett tone!
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">10+</div>
                <div className="text-gray-600">Nyhetskilder</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
                <div className="text-gray-600">Oppdatering</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">3</div>
                <div className="text-gray-600">Quiz-typer</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
                <div className="text-gray-600">Gratis (MVP)</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-gradient-to-r from-secondary-800 to-secondary-900 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Klar for å dykke inn?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start med å utforske dagens nyheter eller test kunnskapen din med en rask quiz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-500 transition-colors"
              >
                Se nyheter
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white rounded-lg font-semibold hover:bg-white/10 transition-colors border border-white/30"
              >
                <Gamepad2 className="mr-2 w-5 h-5" />
                Start quiz
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <span className="text-xl font-bold text-white">Makro Oppdatering</span>
                <p className="text-sm mt-1">MVP-versjon - Bygget for læring</p>
              </div>
              <div className="flex space-x-6">
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Nyheter
                </Link>
                <Link href="/summary" className="hover:text-white transition-colors">
                  Oppsummering
                </Link>
                <Link href="/quiz" className="hover:text-white transition-colors">
                  Quiz
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
              © 2024 Makro Oppdatering. MVP for demonstrasjon.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
