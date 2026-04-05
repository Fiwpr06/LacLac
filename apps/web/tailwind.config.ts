import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF6B35',
          secondary: '#2D3561',
          accent: '#FFC914',
          surface: '#FAFAF8',
          error: '#E74C3C',
        },
      },
    },
  },
  plugins: [],
};

export default config;
