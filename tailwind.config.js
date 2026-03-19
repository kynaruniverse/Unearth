/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          amber: "#f59e0b",
          teal: "#14b8a6",
          sand: "#fbbf24",
          clay: "#b45309",
          midnight: "#0f172a",
          charcoal: "#1e293b",
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
