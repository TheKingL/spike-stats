/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        uni: '#004F9E',
        uniLight: '#1a6fce',
        uniGold: '#FFB81C',
        uniGoldLight: '#ffd166',
        surf: '#00c9a7',
        surfDark: '#009e83',
        ember: '#f97316',
        grape: '#a855f7',
        s0: '#080c14',
        s1: '#0d1117',
        s2: '#161b22',
        s3: '#1c2230',
        s4: '#21293d',
        border: 'rgba(255,255,255,0.07)',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 79, 158, 0.35)',
        'glow-gold': '0 0 20px rgba(255, 184, 28, 0.25)',
        'glow-surf': '0 0 20px rgba(0, 201, 167, 0.25)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
