<svelte:options runes={true} />

<script module  lang="ts">
    export interface CancelButtonProps
        extends OrgPlannerColorThemableComponentProps {
        oncancel: (event: MouseEvent) => void;
    }
</script>

<script lang="ts">
    import Button from "../Button.svelte";

    import {
        AppDynamicColorThemeColorSelector,
        type OrgPlannerColorThemableComponentProps,
    } from "@src/components/theme";

    let { appDynamicColorTheme, oncancel }: CancelButtonProps = $props();
</script>

<Button
    {appDynamicColorTheme}
    colorSelector={AppDynamicColorThemeColorSelector.NONE}
    onclick={oncancel}>Cancel</Button
>
