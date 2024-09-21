import flowbitePlugin from "flowbite/plugin"
import type {Config} from "tailwindcss";
import colors from "tailwindcss/colors";

export default {
    content:
        [
            "./src/main/**/*.{html,js,svelte,ts}", "../node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
            "./node_modules/@sphyrna/uicomponents/build/dist/**/*.{html,js,svelte,ts}"
        ],
    safelist:
        [
            {pattern : /bg.*/, variants : [ "hover" ]}, {pattern : /text.*/},
            {pattern : /border.*/, variants : [ "hover", "focus" ]}
        ],
    theme: {
        fontFamily: {
            sans:
                [
                    "Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto",
                    "Helvetica Neue", "Arial", "Noto Sans", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji",
                    "Segoe UI Symbol", "Noto Color Emoji"
                ],
        },
        colors: {
            black: colors.black,
            overlay: colors.neutral["950"],
            surface: {
                lightest: "#FFFFFF",
                light: "#FFFFFF",
                DEFAULT: "#FFFFFF",
                dark: "#FFFFFFF",
                darkest: "#FFFFFF",
                text: colors.black
            },
            success: {DEFAULT: "#C1DD97", text: colors.black},
            warning: {DEFAULT: "#E4C25E", text: colors.black},
            error: {
                lightest: "#EFD2D2",
                light: "#E4B4B5",
                DEFAULT: "#D17F81",
                dark: "#C9696B",
                darkest: "#B44143x",
                text: colors.black
            },
        }
    },

    plugins: [ flowbitePlugin ]
} as Config;