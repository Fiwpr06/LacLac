import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF3B30',      // Red from FoodFlick
          primaryHover: '#E5352A', // Darker Red
          secondary: '#1A1A1A',    // Dark grey
          accent: '#FF3B30',
          surface: '#FFFFFF',
          background: '#FAFAFA',   // Light gray background
          border: '#EAEAEA',
          error: '#E74C3C',
          muted: '#8E8E93',        // Grey text
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        float: '0 12px 32px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};

export default config;
