import type { Config } from 'tailwindcss';
import { iPurposeTailwindPlugin } from './ipurpose-tailwind-plugin';

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [iPurposeTailwindPlugin],
};

export default config;
