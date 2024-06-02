<svelte:options runes={true} />

<script lang="ts">
    import {
        OrgPlannerColorThemes,
        type OrgEntityPropertyDescriptor,
    } from "orgplanner-common/model";

    import { OrgChartMode } from "./orgChartViewState";
    import { OrgChartHelper, type OrgChartProps } from "./orgChartHelper";
    import { onMount } from "svelte";

    // HTML Element for maxgraph
    let chartContainer: HTMLElement | undefined;
    let orgChartHelper: OrgChartHelper | undefined;

    let {
        orgStructure,
        mode = OrgChartMode.PLANNING,
        colorTheme = OrgPlannerColorThemes.DEEP_BLUE_THEME,
        propertyDescriptors = new Set<OrgEntityPropertyDescriptor>(),
    }: OrgChartProps = $props();

    onMount(() => {
        if (!chartContainer) {
            throw new Error("chartContainer undefined in mount");
        }
        orgChartHelper = new OrgChartHelper(chartContainer);
        orgChartHelper.onMount();

        return () => {
            if (!orgChartHelper) {
                throw new Error("orgChartHelper undefined in dismount");
            }
            orgChartHelper.onDismount();
        };
    });

    $effect(() => {
        if (!orgChartHelper) {
            throw new Error("orgChartHelper undefined in $effect");
        }
        orgChartHelper.updated({
            orgStructure,
            mode,
            colorTheme,
            propertyDescriptors,
        });
    });
</script>

<div
    data-id="chart-container"
    data-testid="chart-container"
    bind:this={chartContainer}
></div>
