<script lang="ts">
    import OrgChart from "@src/components/orgchart/OrgChart.svelte";
    import { OrgChartMode } from "@src/components/orgchart/orgChartViewState";

    export let data;
</script>

<div class="container mx-auto h-screen px-4 flex justify-between">
    <OrgChart
        data-id="org_chart"
        orgStructure={data.orgPlanner.planningProject.orgPlan.orgDataCore
            .orgStructure}
        mode="${OrgChartMode.PLANNING}"
        colorTheme={data.orgPlanner.settings.colorTheme}
        propertyDescriptors={data.orgPlanner.settings
            .employeePropertyDescriptors}
    />
    `;
</div>
