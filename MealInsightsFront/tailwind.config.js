/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // If you plan to use Mantine components within files scanned by Tailwind,
    // ensure this path is correctly configured.
    // Mantine's internal styles are handled by MantineProvider,
    // but if you extend Mantine with custom components that use Tailwind,
    // or if you use Mantine with `@mantine/tailwind` (which is not standard anymore,
    // you typically use them side-by-side), ensure your components are scanned.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}