<script lang="ts">
    import OrgChartEditingToolbar from "@src/components/orgchart/toolbar/OrgChartEditingToolbar.svelte";

    import { type OrgPlannerColorThemableComponentProps } from "@src/components/theme.js";
    import type { OrgStructure } from "orgplanner-common/model";
    import type { OrgPlannerSettings } from "@src/model/orgPlanner";
    import { OrgChart, OrgChartMode } from "orgplanner-orgchart";

    interface OrgChartPaneProps extends OrgPlannerColorThemableComponentProps {
        orgStructure: OrgStructure;
        settings: OrgPlannerSettings;
    }

    let { orgStructure, settings, appDynamicColorTheme }: OrgChartPaneProps =
        $props();
    let colorTheme = $derived(settings.colorTheme);
    let propertyDescriptors = $derived(settings.employeePropertyDescriptors);
</script>

<OrgChartEditingToolbar {appDynamicColorTheme} {orgStructure}
></OrgChartEditingToolbar>
<OrgChart
    data-id="org_chart"
    {orgStructure}
    mode={OrgChartMode.EDIT}
    {colorTheme}
    {propertyDescriptors}
/>
