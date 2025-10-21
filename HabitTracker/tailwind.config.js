/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        dark_bg: "#141414", 
        grey_text: "#949494",
        white: '#F0F0F0',
        dark_grey: "#1C1C1F",
        light_grey: "#373738",
        green: "#48ea76",
        dark_green: "#15301c",
        light_green: "#a5c9a7",
      },
    },
  },
  plugins: [],
};
