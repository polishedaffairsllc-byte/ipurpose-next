/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        indigoDeep: "#4B4E6D",
        lavenderViolet: "#9C88FF",
        salmonPeach: "#FCC4B7",
        warmCharcoal: "#2C2D33",
        offWhite: "#FAFAFA",
        softGold: "#F5E8C7",
      },
      fontFamily: {
        italiana: ["Italiana", "serif"],
        marcellus: ["Marcellus", "serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
      container: {
        center: true,
        padding: "1.5rem",
      },
    },
  },
  plugins: [],
};
