<svelte:options runes={true} />

<script lang="ts">
    import {
        AppDynamicColorThemeColorSelector,
        tempgetDynamicColorTheme,
        type OrgPlannerColorThemableComponentProps,
    } from "@src/components/theme";
    import { IconButton } from "@sphyrna/uicomponents";

    interface OrgChartEditingToolbarButtonProps
        extends OrgPlannerColorThemableComponentProps {
        symbol: string;
        onclick?: (e: MouseEvent) => void;
    }

    let {
        id,
        symbol,
        onclick,
        appDynamicColorTheme,
        ...restProps
    }: OrgChartEditingToolbarButtonProps = $props();
</script>

<IconButton
    {id}
    colorVariant={AppDynamicColorThemeColorSelector.SECONDARY.toString()}
    dynamicColorTheme={tempgetDynamicColorTheme(appDynamicColorTheme)}
    {onclick}
    {...restProps}
>
    <svg class="w-4 h-4 fill-white">
        <use xlink:href="symbols.svg#{symbol}"> </use>
    </svg>
</IconButton>
