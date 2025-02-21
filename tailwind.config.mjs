/** @type {import('tailwindcss').Config} */
export default {
  purge: {
    content: [
      "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
      "*.{js,ts,jsx,tsx,mdx}",
    ],
    safelist: ["order-1", "order-2"],
  },
  theme: {
    extend: {
      colors: {
        background: "#121212",
        foreground: "#ffffff",
        muted: "#252424",
      },
    },
  },
  plugins: [],
};
