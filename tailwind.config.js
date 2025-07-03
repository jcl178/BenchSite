/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'maroon': {
          primary: '#800020',
          secondary: '#A0002A',
          accent: '#B91036',
          light: '#D4456B',
        },
        'gold': {
          primary: '#D4AF37',
          light: '#F7E98E',
          dark: '#B8860B',
        },
        'cream': '#FFF8DC',
        'warm': {
          white: '#FEFBF3',
          gray: '#F5F1E8',
        },
        'text': {
          dark: '#2C1810',
          light: '#6B4E3D',
          gold: '#8B6914',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-maroon': 'linear-gradient(135deg, #800020 0%, #A0002A 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #F7E98E 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #FEFBF3 0%, #FFF8DC 100%)',
      },
      boxShadow: {
        'elegant': '0 4px 20px rgba(128, 0, 32, 0.1)',
        'gold': '0 4px 20px rgba(212, 175, 55, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 