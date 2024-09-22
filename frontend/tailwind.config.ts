import flowbitePlugin from "flowbite/plugin"
import type {Config} from "tailwindcss";
import colors from "tailwindcss/colors";
import plugin from "tailwindcss/plugin";

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
                light: "#F7F7F7",
                DEFAULT: "#FFFFFF",
                dark: "#F0F0F0",
                darkest: "#F0F0F0",
                text: {DEFAULT: colors.black, placeholder: "#BFBFBF"}
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
        },
        placeholderColor: {surface: "#BFBFBF"},
    },

    plugins:
        [
            flowbitePlugin, plugin(function({addVariant}) {
                addVariant("data_placeholder", "&[data-placeholder]");
            })
        ]
} as Config;