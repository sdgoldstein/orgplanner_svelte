<script lang="ts">
    import { getAppDynamicColorTheme } from "@src/components/theme.js";
    import OrgView from "@src/components/page/OrgView.svelte";

    let { data } = $props();

    let appDynamicColorTheme = getAppDynamicColorTheme(
        data.orgPlanner.settings.colorTheme,
    );
    let orgStructure = $derived(
        data.orgPlanner.planningProject.orgPlan.orgDataCore.orgStructure,
    );
</script>

<OrgView
    {appDynamicColorTheme}
    {orgStructure}
    settings={data.orgPlanner.settings}
/>
