/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EA580C', // FoodBridge Orange
          hover: '#D946EF',   
          dark: '#C2410C',    // Deep Amber Orange
          darker: '#9A3412',  // Burnt Sienna
          light: '#FFEDD5',   // Warm Peach Tint
          subtle: '#FFF7ED',  // Warm Light Cream
        },
        navy: {
          DEFAULT: '#0F172A', // Slate Dark Navy / Black
          dark: '#020617',    // Deepest Midnight
          card: '#1E293B',    // Navy Card surface
          light: '#334155',   // Muted Navy slate
          border: '#334155',
        },
        surface: {
          bg: '#F8FAFC',      // Crisp light neutral SaaS canvas
          card: '#FFFFFF',    // Pure White Card
          subtle: '#F1F5F9',  // Light Slate surface
          muted: '#E2E8F0',   // Light border accent
        },
        txt: {
          primary: '#0F172A', // Crisp Navy Charcoal
          secondary: '#475569', // Slate Gray
          muted: '#94A3B8',   // Light Slate Gray
          white: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E2E8F0',
          dark: '#CBD5E1',
          orange: '#FDBA74',
        },
        status: {
          success: '#10B981', // Emerald Safe
          warning: '#F59E0B', // Amber Alert
          danger: '#EF4444',  // Red Critical
          info: '#3B82F6',    // Blue Transit
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      screens: {
        xs: '420px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        md: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
        xl: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'card-hover': '0 10px 25px -5px rgba(234, 88, 12, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        orange: '0 10px 25px -5px rgba(234, 88, 12, 0.35)',
      },
      borderRadius: {
        card: '16px',
      }
    },
  },
  plugins: [],
};
