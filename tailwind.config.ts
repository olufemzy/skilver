// import type { Config } from "tailwindcss";

// const config: Config = {
//   darkMode: "class",
//   content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
//   theme: {
//     extend: {
//       colors: {
//         paper: "#FAF9F5",
//         surface: "#F2EFE7",
//         ink: {
//           DEFAULT: "#141A17",
//           soft: "#3E463F",
//           faint: "#767F76",
//         },
//         line: "#DFDACD",
//         primary: {
//           DEFAULT: "#1F3D3A",
//           light: "#2F5750",
//           dark: "#132725",
//         },
//         gold: {
//           DEFAULT: "#C89B3C",
//           light: "#DBBD75",
//           dark: "#9C7627",
//         },
//         danger: "#B3402C",
//       },
//       fontFamily: {
//         display: ["var(--font-fraunces)", "serif"],
//         sans: ["var(--font-inter)", "sans-serif"],
//       },
//       borderRadius: {
//         sm: "4px",
//         DEFAULT: "6px",
//         lg: "10px",
//         card: "14px",
//       },
//       maxWidth: {
//         prose: "68ch",
//       },
//     },
//   },
//   plugins: [],
// };

// export default config;

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#0D4A2F',
          950: '#052e16',
          DEFAULT: '#0D4A2F',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
          dark: '#D97706',
        },
        surface: {
          DEFAULT: '#FAFAFA',
          card: '#FFFFFF',
          muted: '#F3F4F6',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.12)',
        modal: '0 20px 60px -10px rgb(0 0 0 / 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config