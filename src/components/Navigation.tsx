'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TickerTape } from './TickerTape';
import { 
  BarChart3, 
  Newspaper, 
  Gamepad2, 
  Menu, 
  X,
  Terminal,
  Zap,
  TrendingUp
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'FEED', icon: Newspaper },
  { href: '/summary', label: 'SUMMARY', icon: BarChart3 },
  { href: '/quiz', label: 'QUIZ', icon: Gamepad2 },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Ticker Tape */}
      <TickerTape />
      
      {/* Main Navigation */}
      <nav className="bg-terminal-card border-b border-terminal-border sticky top-0 z-50">
        <div className="max-w-full px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <Terminal className="w-5 h-5 text-bloomberg-orange group-hover:text-bloomberg-orange-light transition-colors" />
              <span className="font-mono text-sm font-bold tracking-wider">
                <span className="text-bloomberg-orange">MAKRO</span>
                <span className="text-terminal-muted">_TERM</span>
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
                    className={cn(
                      'flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono transition-all',
                      isActive
                        ? 'bg-bloomberg-orange text-white'
                        : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-border'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right side - Status */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-market-up animate-pulse" />
                <span className="text-2xs font-mono text-terminal-muted">LIVE</span>
              </div>
              <div className="text-2xs font-mono text-terminal-muted">
                {new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-terminal-text hover:text-bloomberg-orange"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-terminal-border bg-terminal-card">
            <div className="px-2 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2.5 text-sm font-mono transition-all',
                      isActive
                        ? 'bg-bloomberg-orange text-white'
                        : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-border'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
