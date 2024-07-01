<svelte:options runes={true} />

<script context="module" lang="ts">
    export interface SubmitButtonProps
        extends OrgPlannerColorThemableComponentProps {}
</script>

<script lang="ts">
    import Button from "../Button.svelte";

    import type { OrgPlannerColorThemableComponentProps } from "@src/components/theme";

    let { appDynamicColorTheme, ...restProps }: SubmitButtonProps = $props();
</script>

<Button {appDynamicColorTheme} {...restProps}>Submit</Button>
