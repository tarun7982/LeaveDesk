/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#12203A',
        slate: {
          50: '#F5F7FA',
          100: '#EAEEF3',
          200: '#D8DFE8',
        },
        brand: {
          DEFAULT: '#1E4E8C',
          dark: '#12203A',
          light: '#E8F0FB',
        },
        accent: '#D98C3F',
        success: '#1F8A5F',
        danger: '#C6482E',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 32, 58, 0.06), 0 4px 12px rgba(18, 32, 58, 0.05)',
      },
    },
  },
  plugins: [],
}

