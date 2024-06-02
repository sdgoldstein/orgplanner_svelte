<script lang="ts">
    import OrgChart from "@src/components/orgchart/OrgChart.svelte";
    import { OrgChartMode } from "@src/components/orgchart/orgChartViewState";
    import { Pane, Splitpanes } from "svelte-splitpanes";

    export let data;
</script>

<div class="container mx-auto h-screen px-4 flex justify-between">
    <Splitpanes theme="org-chart-splitter-theme">
        <Pane>
            <OrgChart
                data-id="org_chart"
                orgStructure={data.orgPlanner.planningProject.orgPlan
                    .orgDataCore.orgStructure}
                mode={OrgChartMode.PLANNING}
                colorTheme={data.orgPlanner.settings.colorTheme}
                propertyDescriptors={data.orgPlanner.settings
                    .employeePropertyDescriptors}
            />
        </Pane>
        <Pane>5</Pane>
    </Splitpanes>
</div>

<style>
    :global(.org-chart-splitter-theme) {
        background-color: white;
    }

    :global(.org-chart-splitter-theme .splitpanes__pane) {
        background-color: white;
    }

    :global(.org-chart-splitter-theme .splitpanes__splitter) {
        background-color: #ccc;
        box-sizing: border-box;
        position: relative;
        flex-shrink: 0;
    }
    :global(
            .org-chart-splitter-theme .splitpanes__splitter:before,
            .org-chart-splitter-theme .splitpanes__splitter:after
        ) {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        background-color: rgba(0, 0, 0, 0.15);
        transition: background-color 0.3s;
    }
    :global(
            .org-chart-splitter-theme .splitpanes__splitter:hover:before,
            .org-chart-splitter-theme .splitpanes__splitter:hover:after
        ) {
        background-color: rgba(0, 0, 0, 0.25);
    }
    :global(.org-chart-splitter-theme .splitpanes__splitter:first-child) {
        cursor: auto;
    }

    :global(
            .org-chart-splitter-theme.splitpanes
                .splitpanes
                .splitpanes__splitter
        ) {
        z-index: 1;
    }
    :global(
            .org-chart-splitter-theme.splitpanes--vertical
                > .splitpanes__splitter,
            .org-chart-splitter-theme
                .splitpanes--vertical
                > .splitpanes__splitter
        ) {
        width: 4px;
        cursor: col-resize;
    }
    :global(
            .org-chart-splitter-theme.splitpanes--vertical
                > .splitpanes__splitter:before,
            .org-chart-splitter-theme.splitpanes--vertical
                > .splitpanes__splitter:after,
            .org-chart-splitter-theme
                .splitpanes--vertical
                > .splitpanes__splitter:before,
            .org-chart-splitter-theme
                .splitpanes--vertical
                > .splitpanes__splitter:after
        ) {
        transform: translateY(-50%);
        width: 1px;
        height: 30px;
    }
    :global(
            .org-chart-splitter-theme.splitpanes--vertical
                > .splitpanes__splitter:before,
            .org-chart-splitter-theme
                .splitpanes--vertical
                > .splitpanes__splitter:before
        ) {
        margin-left: -2px;
    }
    :global(
            .org-chart-splitter-theme.splitpanes--vertical
                > .splitpanes__splitter:after,
            .org-chart-splitter-theme
                .splitpanes--vertical
                > .splitpanes__splitter:after
        ) {
        margin-left: 1px;
    }
</style>
