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

    const dynamicColorThemeMap = tempgetDynamicColorTheme(appDynamicColorTheme);
    const colorVariant = AppDynamicColorThemeColorSelector.SECONDARY.toString();
</script>

<IconButton {id} {colorVariant} dynamicColorTheme={dynamicColorThemeMap} {onclick} {...restProps}>
    <svg class="w-4 h-4">
        <use
            xlink:href="symbols.svg#{symbol}"
            style="fill:{dynamicColorThemeMap.colorThemes.get(colorVariant)!.textColor}"
        ></use>
    </svg>
</IconButton>
