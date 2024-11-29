import adapter from "@sveltejs/adapter-auto";
import {vitePreprocess} from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess : vitePreprocess(),

    kit : {
        files : {
            assets : "src/main/static",
            hooks : {client : "src/main/app/hooks.client"},
            routes : "src/main/routes",
            appTemplate : "src/main/app/app.html"
        },
        alias : {"@src" : "src/main"},
        // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://kit.svelte.dev/docs/adapters for more information about adapters.
        adapter : adapter()
    },

    compilerOptions : {},
    vitePlugin : {inspector : true}
};

export default config;
