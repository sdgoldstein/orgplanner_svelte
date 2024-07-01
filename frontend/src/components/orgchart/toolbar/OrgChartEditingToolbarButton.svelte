<svelte:options runes={true} />

<script lang="ts">
    import {
        AppDynamicColorThemeColorSelector,
        type OrgPlannerColorThemableComponentProps,
    } from "@src/components/theme";
    import Button from "@src/components/ui/Button.svelte";

    interface OrgChartEditingToolbarButtonProps
        extends OrgPlannerColorThemableComponentProps {
        symbol: string;
        onclick?: (e: MouseEvent) => void;
    }

    let {
        symbol,
        onclick,
        appDynamicColorTheme,
        ...restProps
    }: OrgChartEditingToolbarButtonProps = $props();
</script>

<Button
    class="flex justify-center w-8 h-8 rounded-full mb-1.5 p-0"
    {appDynamicColorTheme}
    colorSelector={AppDynamicColorThemeColorSelector.SECONDARY}
    {...restProps}
    {onclick}
>
    <svg class="w-4 h-4 fill-white">
        <use xlink:href="symbols.svg#{symbol}"> </use>
    </svg>
</Button>
