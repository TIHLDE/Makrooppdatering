import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // High contrast terminal colors
        terminal: {
          bg: '#000000',
          card: '#111111',
          border: '#333333',
          text: '#ffffff',
          muted: '#aaaaaa',
        },
        bloomberg: {
          orange: '#ff6b35',
          'orange-light': '#ff8555',
          'orange-dark': '#e55a2b',
        },
        market: {
          up: '#00d084',
          down: '#ff4444',
          neutral: '#888888',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xs': '0.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
