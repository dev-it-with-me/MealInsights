/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@skeletonlabs/skeleton-react/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
}