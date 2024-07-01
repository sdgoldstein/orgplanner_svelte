import flowbitePlugin from 'flowbite/plugin'
import type {Config} from "tailwindcss";

export default {
    content: [ "./src/**/*.{html,js,svelte,ts}", "../node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}" ],

    theme: {
        fontFamily: {
            sans: [ 'var( --theme-font-family)' ],
        },
        colors: {
            'success': {
                50: 'rgb(var(--color-success-50) / <alpha-value>)',
                100: 'rgb(var(--color-success-100) / <alpha-value>)',
                200: 'rgb(var(--color-success-200) / <alpha-value>)',
                300: 'rgb(var(--color-success-300) / <alpha-value>)',
                400: 'rgb(var(--color-success-400) / <alpha-value>)',
                500: 'rgb(var(--color-success-500) / <alpha-value>)',
                600: 'rgb(var(--color-success-600) / <alpha-value>)',
                700: 'rgb(var(--color-success-700) / <alpha-value>)',
                800: 'rgb(var(--color-success-800) / <alpha-value>)',
                900: 'rgb(var(--color-success-900) / <alpha-value>)',
            },
            'warning': {
                50: 'rgb(var(--color-warning-50) / <alpha-value>)',
                100: 'rgb(var(--color-warning-100) / <alpha-value>)',
                200: 'rgb(var(--color-warning-200) / <alpha-value>)',
                300: 'rgb(var(--color-warning-300) / <alpha-value>)',
                400: 'rgb(var(--color-warning-400) / <alpha-value>)',
                500: 'rgb(var(--color-warning-500) / <alpha-value>)',
                600: 'rgb(var(--color-warning-600) / <alpha-value>)',
                700: 'rgb(var(--color-warning-700) / <alpha-value>)',
                800: 'rgb(var(--color-warning-800) / <alpha-value>)',
                900: 'rgb(var(--color-warning-900) / <alpha-value>)',
            },
            'error': {
                50: 'rgb(var(--color-error-50) / <alpha-value>)',
                100: 'rgb(var(--color-error-100) / <alpha-value>)',
                200: 'rgb(var(--color-error-200) / <alpha-value>)',
                300: 'rgb(var(--color-error-300) / <alpha-value>)',
                400: 'rgb(var(--color-error-400) / <alpha-value>)',
                500: 'rgb(var(--color-error-500) / <alpha-value>)',
                600: 'rgb(var(--color-error-600) / <alpha-value>)',
                700: 'rgb(var(--color-error-700) / <alpha-value>)',
                800: 'rgb(var(--color-error-800) / <alpha-value>)',
                900: 'rgb(var(--color-error-900) / <alpha-value>)',
            },
            'surface': {
                50: 'rgb(var(--color-surface-50) / <alpha-value>)',
                100: 'rgb(var(--color-surface-100) / <alpha-value>)',
                200: 'rgb(var(--color-surface-200) / <alpha-value>)',
                300: 'rgb(var(--color-surface-300) / <alpha-value>)',
                400: 'rgb(var(--color-surface-400) / <alpha-value>)',
                500: 'rgb(var(--color-surface-500) / <alpha-value>)',
                600: 'rgb(var(--color-surface-600) / <alpha-value>)',
                700: 'rgb(var(--color-surface-700) / <alpha-value>)',
                800: 'rgb(var(--color-surface-800) / <alpha-value>)',
                900: 'rgb(var(--color-surface-900) / <alpha-value>)',
            },
            'onsuccess': 'rgb(var (--text-on-success) / <alpha - value>)',
            'onwarning': 'rgb(var(--text-on-warning) / <alpha-value>)',
            'onerror': 'rgb(var(--text-on-error) / <alpha-value>)',
            'onsurface': 'rgb(var(--text-on-surface) / <alpha-value>)'
        }
    },

    plugins: [ flowbitePlugin ]
} as Config;