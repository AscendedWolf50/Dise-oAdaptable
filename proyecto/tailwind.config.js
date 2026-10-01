/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vd-slate': '#1B384B',
        'vd-muted': '#8BA3A7',
        'vd-orange': '#FF7800',
        'vd-black': '#0D0D0D',
        'vd-white': '#FFFFFF',
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #0D0D0D',
        'brutal-sm': '2px 2px 0px 0px #0D0D0D',
        'brutal-lg': '6px 6px 0px 0px #0D0D0D',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
}
