/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // VITAL: This line tells Tailwind to look inside the src directory for all .js, .ts, .jsx, and .tsx files.
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}