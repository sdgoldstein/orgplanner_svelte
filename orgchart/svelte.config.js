import adapter from "@sveltejs/adapter-auto";
import {vitePreprocess} from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess : vitePreprocess({script : true}),

    kit : {
        files :
            {assets : "src/app/static", routes : "src/app/routes", appTemplate : "src/app/app.html", lib : "src/main"},
        alias : {"@src" : "src/main"},
        // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://svelte.dev/docs/kit/adapters for more information about adapters.
        adapter : adapter()
    },
    compilerOptions : {},
    vitePlugin : {inspector : true}
};

export default config;
