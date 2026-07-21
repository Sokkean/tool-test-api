/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: 'rgb(var(--theme-50) / <alpha-value>)',
          100: 'rgb(var(--theme-100) / <alpha-value>)',
          200: 'rgb(var(--theme-200) / <alpha-value>)',
          300: 'rgb(var(--theme-300) / <alpha-value>)',
          400: 'rgb(var(--theme-400) / <alpha-value>)',
          500: 'rgb(var(--theme-500) / <alpha-value>)',
          600: 'rgb(var(--theme-600) / <alpha-value>)',
          700: 'rgb(var(--theme-700) / <alpha-value>)',
          800: 'rgb(var(--theme-800) / <alpha-value>)',
          900: 'rgb(var(--theme-900) / <alpha-value>)',
          950: 'rgb(var(--theme-950) / <alpha-value>)',
        },
        syntax: {
          key: 'rgb(var(--syntax-key) / <alpha-value>)',
          str: 'rgb(var(--syntax-str) / <alpha-value>)',
          num: 'rgb(var(--syntax-num) / <alpha-value>)',
          bool: 'rgb(var(--syntax-bool) / <alpha-value>)',
          null: 'rgb(var(--syntax-null) / <alpha-value>)',
          bg: 'rgb(var(--syntax-bg) / <alpha-value>)',
        }
      }
    },
  },
  plugins: [],
}
