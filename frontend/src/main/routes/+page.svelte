<script lang="ts">
    import { getAppDynamicColorTheme } from "@src/components/theme.js";
    import OrgPage from "@src/components/page/OrgPage.svelte";

    let { data } = $props();

    let appDynamicColorTheme = getAppDynamicColorTheme(
        data.orgPlanner.settings.colorTheme,
    );
    let orgStructure = $derived(
        data.orgPlanner.planningProject.orgPlan.orgDataCore.orgStructure,
    );
</script>

<OrgPage
    {appDynamicColorTheme}
    {orgStructure}
    settings={data.orgPlanner.settings}
/>
