<script lang="ts">
    import {
        OrgEntityColorThemes,
        type OrgEntityPropertyDescriptor,
    } from "orgplanner-common/model";

    import { OrgChartMode } from "./orgChartViewState";
    import { onMount } from "svelte";
    import type {
        OrgChartProxy,
        OrgChartProps,
    } from "./graph/model/orgChartProxy";
    import { EditableOrgChartProxy } from "./graph/editable/editableOrgChartProxy";

    // HTML Element for maxgraph
    let chartContainer: HTMLElement | undefined;
    let orgChartHelper: OrgChartProxy | undefined;
    let width: number = $state(0);

    let {
        orgStructure,
        mode = OrgChartMode.EDIT,
        colorTheme = OrgEntityColorThemes.DEEP_BLUE_THEME,
        propertyDescriptors = new Set<OrgEntityPropertyDescriptor>(),
    }: OrgChartProps = $props();

    onMount(() => {
        if (!chartContainer) {
            throw new Error("chartContainer undefined in mount");
        }
        orgChartHelper = new EditableOrgChartProxy(chartContainer);
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
        if (width > 0) {
            // FIXME - Mode change requires swap of proxy?
            orgChartHelper.onUpdate({
                orgStructure,
                mode,
                colorTheme,
                propertyDescriptors,
            });
        }
    });
</script>

<div
    id="chart-container"
    data-id="chart-container"
    data-testid="chart-container"
    class="w-full"
    bind:this={chartContainer}
    bind:clientWidth={width}
></div>
