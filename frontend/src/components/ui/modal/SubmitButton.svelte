<svelte:options runes={true} />

<script module  lang="ts">
    export interface SubmitButtonProps
        extends OrgPlannerColorThemableComponentProps {}
</script>

<script lang="ts">
    import Button from "../Button.svelte";

    import { AppDynamicColorThemeColorSelector, type OrgPlannerColorThemableComponentProps } from "@src/components/theme";

    let { appDynamicColorTheme, ...restProps }: SubmitButtonProps = $props();
</script>

<Button colorVariant={AppDynamicColorThemeColorSelector.PRIMARY.toString()} {appDynamicColorTheme} {...restProps}>Submit</Button>
