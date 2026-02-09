module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        cream: '#FBF7F0',
        'purple-primary': '#6B5FED',
        'purple-dark': '#3D2E7C',
        'purple-light': '#9B8FEE',
        'purple-lavender': '#E5DFF7',
        gold: '#F5A623',
        'gold-light': '#FFD166',
        'accent-blue': '#4FC3F7',
        'accent-coral': '#FFB997',
        'accent-peach': '#FFA97A',
        'accent-mint': '#A8E6CF',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'float-right': 'float-right 8s ease-in-out infinite',
        'float-delayed-right': 'float-right 8s ease-in-out 4s infinite',
        'float-slow-right': 'float-right 10s ease-in-out 2s infinite',
        'bounce-subtle': 'bounce-subtle 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-right': {
          '0%, 100%': { 
            transform: 'translate(0px, 0px)',
          },
          '33%': { 
            transform: 'translate(15px, -25px)',
          },
          '66%': { 
            transform: 'translate(-10px, -15px)',
          },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}