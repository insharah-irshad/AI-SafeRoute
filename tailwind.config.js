/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Safety score bands — used consistently for pins, badges, route cards
        safe: '#1E8E5A',      // green — score >= 70
        caution: '#D9A404',   // yellow — score 40-69
        risk: '#D14343',      // red — score < 40
        unknown: '#8A8F98',   // insufficient_data
        ink: '#1B1F23',
        paper: '#FAF9F6',
      },
    },
  },
  plugins: [],
};
