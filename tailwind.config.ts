import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0d1117",
        surface: "#161b22",
        border: "#30363d",
        "text-primary": "#e6edf3",
        "text-secondary": "#8b949e",
        accent: "#58a6ff",
      },
    },
  },
  plugins: [],
};

export default config;
