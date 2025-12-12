/** @type {import('tailwindcss').Config} */
const iPurposeTailwindPlugin = require('./ipurpose-tailwind-plugin.ts').default;

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [iPurposeTailwindPlugin],
};
