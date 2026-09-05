/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          dark: '#0B192C',
          navy: '#1E3E62',
          blue: '#1E293B',
          light: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
        },
        primary: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#B9DDFF',
          300: '#7CC2FF',
          400: '#36A2FF',
          500: '#0C84EB',
          600: '#0066C7',
          700: '#0051A1',
          800: '#054484',
          900: '#0B192C',
          950: '#06101E',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          subtle: '#EFF6FF',
        },
        success: {
          subtle: '#ECFDF5',
          border: '#A7F3D0',
          text: '#065F46',
          DEFAULT: '#10B981',
        },
        warning: {
          subtle: '#FFFBEB',
          border: '#FDE68A',
          text: '#92400E',
          DEFAULT: '#F59E0B',
        },
        error: {
          subtle: '#FEF2F2',
          border: '#FECACA',
          text: '#991B1B',
          DEFAULT: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'gov': '14px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevation': '0 10px 25px -5px rgba(11, 25, 44, 0.08), 0 8px 10px -6px rgba(11, 25, 44, 0.04)',
      }
    },
  },
  plugins: [],
}
