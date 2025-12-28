/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        dark_bg: '#141414',
        grey_text: '#949494',
        white: '#F0F0F0',
        off_white: '#dddddd',
        dark_grey: '#1C1C1F',
        light_grey: '#373738',
        divider_grey: '#525252',
        green: '#48ea76',
        dark_green: '#122118',
        light_green: '#a5c9a7',
      },
      fontSize: {
        title_Font : "22px"
      }
    },
  },
  plugins: [],
};
