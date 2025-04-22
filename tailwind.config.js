/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C5DD3',
          hover: '#8674FF'
        },
        dark: {
          DEFAULT: '#0F1729',
          lighter: '#1A2236',
          card: '#1E293B'
        },
        status: {
          high: '#FF6B6B',
          medium: '#FFA726',
          low: '#4CAF50',
          completed: '#22C55E',
          'in-progress': '#EAB308'
        }
      }
    },
  },
  plugins: [],
};
