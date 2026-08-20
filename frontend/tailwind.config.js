/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Defining the civic reporter palette
        'up-gov-blue': '#1E40AF',
        'up-gov-dark-blue': '#1E3A8A',
        'up-gov-light-blue': '#DBEAFE',
        // Adding the primary scale used in your index.css
        'primary': {
          600: '#2563eb',
          700: '#1d4ed8',
          500: '#3b82f6',
        }
      },
    },
  },
  plugins: [],
}
