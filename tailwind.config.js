/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './devtools.html'],
  theme: {
    extend: {
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

