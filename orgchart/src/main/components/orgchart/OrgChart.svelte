<script lang="ts">
    import {
        OrgEntityColorThemes,
        type OrgEntityPropertyDescriptor,
    } from "orgplanner-common/model";

    import { onMount } from "svelte";
    import type { OrgChartProxy } from "./graph/mode/base/orgChartProxy";
    import { OrgChartMode, type OrgChartProps } from "./orgChart";
    import OrgChartProxyFactory from "./graph/mode/base/orgChartProxyFactory";

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
        orgChartHelper = OrgChartProxyFactory.instance.getOrgChartProxy(mode);
        orgChartHelper.onMount(chartContainer);

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
