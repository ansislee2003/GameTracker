/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    presets: [require("nativewind/preset")], // Add this line
    theme: {
        extend: {
            colors: {
                primary: '#424242',
                secondary: {
                    100: '#438ee4',
                    200: '#406caf',
                },
                light: '#ffffff',
                dark: {
                    100: '#221F3D',
                    200: '#0F0D23',
                },
                accent: '#2196F3',
                background: '#f1eee7',
            }
        },
    },
    plugins: [],
};
