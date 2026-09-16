/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        minecraft: ['"Minecraftia"', '"Press Start 2P"', 'monospace'],
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        mc: {
          gray: {
            100: '#d5d5d5',
            200: '#c6c6c6',
            300: '#8b8b8b',
            400: '#585858',
            500: '#373737',
            600: '#222222',
            700: '#141414',
          },
          dirt: '#866043',
          stone: '#707070',
          darkstone: '#383838',
          wood: '#9c6f44',
          grass: '#5b8c34',
          gold: '#fba800',
          yellow: '#ffff55',
          diamond: '#4dedf4',
          emerald: '#17dd62',
          redstone: '#ff2200',
          lapis: '#224ba4',
          nether: '#541515',
          portal: '#8c25db'
        }
      },
      boxShadow: {
        'mc-button': 'inset -2px -4px 0px 0px #383838, inset 2px 2px 0px 0px #ffffff40, inset -2px -2px 0px 0px #585858',
        'mc-button-active': 'inset 2px 4px 0px 0px #222222, inset -2px -2px 0px 0px #ffffff20',
        'mc-panel': 'inset -3px -3px 0px 0px #373737, inset 3px 3px 0px 0px #ffffff, inset -3px 3px 0px 0px #8b8b8b, inset 3px -3px 0px 0px #8b8b8b',
        'mc-slot': 'inset 2px 2px 0px 0px #373737, inset -2px -2px 0px 0px #ffffff',
      },
      animation: {
        'splash': 'splash 1.5s ease-in-out infinite alternate',
        'bob': 'bob 2s ease-in-out infinite alternate',
      },
      keyframes: {
        splash: {
          '0%': { transform: 'scale(1) rotate(-15deg)' },
          '100%': { transform: 'scale(1.08) rotate(-13deg)' },
        },
        bob: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

