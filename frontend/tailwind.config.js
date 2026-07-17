/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-sans)',
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'Segoe UI',
  				'Roboto',
  				'Helvetica Neue',
  				'Arial',
  				'Noto Sans',
  				'Apple Color Emoji',
  				'Segoe UI Emoji',
  				'Segoe UI Symbol'
  			],
  			display: [
  				'var(--font-display)',
  				'Fraunces',
  				'Georgia',
  				'serif'
  			],
  			mono: [
  				'var(--font-mono)',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			]
  		},
  		colors: {
  			background: '#F8F6F0',
  			surface: '#FFFFFF',
  			primary: {
  				DEFAULT: '#b5511b', // Tasteful terracotta orange
  				foreground: '#FFFFFF'
  			},
  			accent: {
  				DEFAULT: '#943b0d', // Rich dark terracotta orange
  				foreground: '#FFFFFF'
  			},
  			'text-primary': '#1A0F0A', // Almost black-brown
  			'text-secondary': '#3E2723', // Dark cocoa
  			'text-muted': '#795548', // Medium brown
  			'border-light': '#E0D7D0',
  			'border-medium': '#C6B8AF',
  			'hover-light': '#F5F2EE',
  			'hover-medium': '#EDE7E0',
  			foreground: '#1A0F0A',
  			card: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#1A0F0A'
  			},
  			popover: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#1A0F0A'
  			},
  			secondary: {
  				DEFAULT: '#FDFCFB',
  				foreground: '#1A0F0A'
  			},
  			muted: {
  				DEFAULT: '#F5F2EE',
  				foreground: '#3E2723'
  			},
  			destructive: {
  				DEFAULT: '#B71C1C',
  				foreground: '#FFFFFF'
  			},
  			border: '#E0D7D0',
  			input: '#E0D7D0',
  			ring: '#5D4037',
  		},
  		boxShadow: {
  			glow: '0 0 15px rgba(93, 64, 55, 0.1)',
  			soft: '0 1px 4px rgba(26, 15, 10, 0.05)',
  			elegant: '0 4px 12px rgba(26, 15, 10, 0.08)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
