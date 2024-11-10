<script lang="ts">
    import OrgChart from "@src/components/orgchart/OrgChart.svelte";
    import OrgChartEditingToolbar from "@src/components/orgchart/toolbar/OrgChartEditingToolbar.svelte";
    import { OrgChartMode } from "@src/components/orgchart/orgChartViewState";
    import { type OrgPlannerColorThemableComponentProps } from "@src/components/theme.js";
    import type { OrgStructure } from "orgplanner-common/model";
    import type { OrgPlannerSettings } from "@src/model/orgPlanner";

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
    mode={OrgChartMode.PLANNING}
    {colorTheme}
    {propertyDescriptors}
/>
