/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './devtools.html'],
  theme: {
    extend: {
      colors: {
        customRed: '#e96c4c',
        customGray: '#6b7175',
        customFont: '#316e7d',
        customBg: '#141e24',
      },
      height: {
        112: '28rem', 
        128: '32rem', 
        144: '36rem', 
        160: '40rem', 
        176: '44rem'  
      },
      maxHeight: {
        112: '28rem',
        128: '32rem',
        144: '36rem',
        160: '40rem',
        176: '44rem'
      }
    },
  },
  plugins: [],
}

