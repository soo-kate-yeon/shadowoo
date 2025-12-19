// tailwind.config.js
// ShadowingNinja Design System - Tailwind Configuration
// Primary: #ED752A | Background: #EBE8E2 | Surface: #F9F7F3

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Color (Orange)
        primary: {
          50: '#FEF7F3',
          100: '#FDEEE6',
          200: '#F8E4D8',
          300: '#F4C9AC',
          400: '#EFA06A',
          500: '#ED752A', // Main brand color
          600: '#D96621',
          700: '#B5541A',
          800: '#8C4115',
          900: '#6B3211',
          950: '#3D1C09',
        },
        
        // Secondary (Warm Neutral/Beige tones)
        secondary: {
          50: '#F9F8F6',
          100: '#F5F3EE',
          200: '#EBE8E2', // Background default
          300: '#DDD9CE',
          400: '#C5BFB1',
          500: '#A9A193',
          600: '#8A8376',
          700: '#6B665B',
          800: '#4D4A42',
          900: '#2C2C2C', // Dark text / Selected state
          950: '#1A1A1A',
        },
        
        // Accent (Blue for contrast)
        accent: {
          50: '#F5F7F9',
          100: '#E8F1F6',
          200: '#C4E0F2',
          300: '#91CCF2',
          400: '#48B1F3',
          500: '#099AF5',
          600: '#0283D3',
          700: '#006AAD',
          800: '#005184',
          900: '#01385A',
          950: '#011E31',
        },
        
        // Neutral (Pure grayscale)
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        
        // Semantic Colors
        success: {
          50: '#F5F8F6',
          100: '#EAF5EE',
          200: '#C9ECD6',
          300: '#9DE6B8',
          400: '#5DDF8C',
          500: '#25D967',
          600: '#1BBA56',
          700: '#139944',
          800: '#0E7534',
          900: '#0B4F24',
        },
        
        warning: {
          50: '#F9F7F5',
          100: '#F6F1E8',
          200: '#F2E1C4',
          300: '#F1CE91',
          400: '#F2B349',
          500: '#F49D0A',
          600: '#D28503',
          700: '#AD6C00',
          800: '#845300',
          900: '#5A3901',
        },
        
        error: {
          50: '#F9F5F5',
          100: '#F6E9E9',
          200: '#F0C6C6',
          300: '#ED9595',
          400: '#EB5050',
          500: '#EA1414',
          600: '#C90C0C',
          700: '#A70606',
          800: '#7F0404',
          900: '#560505',
        },
        
        info: {
          50: '#F5F6F9',
          100: '#E8EEF6',
          200: '#C4D5F2',
          300: '#92B6F1',
          400: '#4A89F2',
          500: '#0B63F3',
          600: '#0452D1',
          700: '#0041AD',
          800: '#003284',
          900: '#012359',
        },
        
        // Background tokens
        background: {
          DEFAULT: '#EBE8E2',
          surface: '#F9F7F3',
          elevated: '#FFFFFF',
        },
        
        // Text tokens
        text: {
          primary: '#000000',
          secondary: '#767676',
          tertiary: '#757575',
        },
        
        // Border tokens
        border: {
          DEFAULT: '#E3E3E3',
          muted: '#D8D8D8',
          strong: '#2C2C2C',
        },
      },
      
      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['SF Pro Display', 'Pretendard', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      
      fontSize: {
        // Custom typography scale (12px - 22px)
        'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],        // 12px
        'body': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],        // 14px
        'body-em': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],     // 14px emphasized
        'title-item': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }],       // 16px
        'title-item-em': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],    // 16px emphasized
        'title-panel': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],  // 18px
        'title-section': ['1.375rem', { lineHeight: '1.75rem', fontWeight: '600' }], // 22px
      },
      
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
      },
      
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        DEFAULT: '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      
      boxShadow: {
        'overlay': '0 4px 24px 0 rgb(0 0 0 / 0.15)',
      },
      
      screens: {
        'mobile': { max: '767px' },
        'tablet': '768px',
        'desktop': '1100px',
        'wide': '1440px',
      },
      
      backdropBlur: {
        'timestamp': '6px',
      },
      
      transitionTimingFunction: {
        'emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
        'emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        'emphasized-accelerate': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      },
      
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.2, 0, 0, 1)',
        'fade-out': 'fadeOut 150ms cubic-bezier(0.3, 0, 0.8, 0.15)',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.2, 0, 0, 1)',
        'slide-up': 'slideUp 300ms cubic-bezier(0.2, 0, 0, 1)',
        'slide-down': 'slideDown 300ms cubic-bezier(0.2, 0, 0, 1)',
      },
      
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
