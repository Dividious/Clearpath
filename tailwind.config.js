/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      colors: {
        cream: '#f9f8f6',
        ink: {
          DEFAULT: '#1a1a18',
          muted: '#5a5a58',
          light: '#9a9a98',
        },
        accent: {
          DEFAULT: '#0f6e56',
          dark: '#0c5c48',
          light: '#dcf0ea',
        },
        slate: {
          brand: '#2d4a7a',
        },
        amber: {
          chart: '#d97706',
        }
      },
      boxShadow: {
        'card': '0 1px 4px 0 rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
      }
    },
  },
  plugins: [],
}
