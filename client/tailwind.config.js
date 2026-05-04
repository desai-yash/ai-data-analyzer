/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172026',
        ocean: '#0f766e',
        leaf: '#65a30d',
        sun: '#f59e0b'
      }
    }
  },
  plugins: []
};

