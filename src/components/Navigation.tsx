'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  BarChart3, 
  Newspaper, 
  Gamepad2, 
  Menu, 
  X,
  Terminal,
} from 'lucide-react';

const navItems: { href: Route; label: string; icon: typeof Newspaper }[] = [
  { href: '/dashboard', label: 'DASHBOARD', icon: Newspaper },
  { href: '/summary', label: 'SUMMARY', icon: BarChart3 },
  { href: '/makrooppdatering', label: 'MAKROOPPDATERING', icon: Gamepad2 },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#161b22] border-b border-[#333] sticky top-0 z-50">
      <div className="max-w-full px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Terminal className="w-5 h-5 text-[#ff6b35]" />
            <span className="font-mono text-sm font-bold tracking-wider">
              <span className="text-[#ff6b35]">MAKRO</span>
              <span className="text-[#666]">_TERMINAL</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-mono font-bold transition-colors ${
                    isActive
                      ? 'bg-[#ff6b35] text-black'
                      : 'text-[#888] hover:text-white hover:bg-[#333]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side - Status */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#0f0] animate-pulse" />
              <span className="text-xs font-mono text-[#0f0]">LIVE</span>
            </div>
            <div className="text-xs font-mono text-[#888]">
              {(() => {
                const now = new Date();
                return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
              })()}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-[#ff6b35]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#333] bg-[#161b22]">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 text-sm font-mono font-bold ${
                    isActive
                      ? 'bg-[#ff6b35] text-black'
                      : 'text-[#888] hover:text-white hover:bg-[#333]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
