import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/component/**/*.{js,ts,jsx,tsx,mdx}',
    './src/ui/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-body)', 'sans-serif'],
        heading: ['var(--font-heading)', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '6': '1.5rem',
        '12': '3rem',
        '18': '4.5rem',
        '34.75': '8.6875rem',
        '50': '12.5rem',
        '55': '13.75rem',
        '60': '15rem',
        '100': '25rem',
        '110': '27.5rem',
        '125': '31.25rem',
        '130': '32.5rem',
        '140': '35rem',
        '175': '43.75rem',
        '200': '50rem',
      },
      fontSize: {
        'base': ['1rem', '1.5rem'],
        'lg': ['1.125rem', '1.5rem'],
      },
    },
  },
  plugins: [],
}

export default config
