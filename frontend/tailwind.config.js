/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tdc: {
          green: {
            DEFAULT: '#123C30',
            light: '#1e5244',
            dark: '#0a231c',
          },
          gold: {
            DEFAULT: '#C59B27',
            light: '#dbaf37',
            dark: '#a17d1b',
          },
          beige: {
            DEFAULT: '#F7F4EB',
            dark: '#ebd9c6',
          },
          cream: {
            DEFAULT: '#F4EFE6',
            dark: '#e3dac7',
          },
          sage: {
            DEFAULT: '#5F7B6B',
            light: '#769282',
            dark: '#485e51',
          },
          charcoal: {
            DEFAULT: '#1D2623',
            light: '#2e3b37',
            dark: '#0f1412',
          }
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
