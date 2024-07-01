<svelte:options runes={true} />

<script lang="ts">
    import OrgChartEditingToolbarButton from "./OrgChartEditingToolbarButton.svelte";
    import NewEmployeeModal from "../modal/NewEmployeeModal.svelte";
    import type { OrgPlannerColorThemableComponentProps } from "@src/components/theme";
    import type { OrgStructure } from "orgplanner-common/model";

    interface OrgChartEditingToolbarProps
        extends OrgPlannerColorThemableComponentProps {
        open: boolean;
        orgStructure: OrgStructure;
    }
    let {
        open = false,
        orgStructure,
        appDynamicColorTheme,
    }: OrgChartEditingToolbarProps = $props();
</script>

<div class="fixed z-40 mt-1 ml-1">
    <OrgChartEditingToolbarButton
        symbol="add"
        {appDynamicColorTheme}
        onclick={() => {
            open = true;
        }}
    ></OrgChartEditingToolbarButton>
    <OrgChartEditingToolbarButton symbol="delete" {appDynamicColorTheme}
    ></OrgChartEditingToolbarButton>
    <OrgChartEditingToolbarButton symbol="undo" {appDynamicColorTheme}
    ></OrgChartEditingToolbarButton>
    <OrgChartEditingToolbarButton symbol="copy" {appDynamicColorTheme}
    ></OrgChartEditingToolbarButton>
    <OrgChartEditingToolbarButton symbol="image" {appDynamicColorTheme}
    ></OrgChartEditingToolbarButton>
    <OrgChartEditingToolbarButton symbol="preview" {appDynamicColorTheme}
    ></OrgChartEditingToolbarButton>
    <OrgChartEditingToolbarButton symbol="settings" {appDynamicColorTheme}
    ></OrgChartEditingToolbarButton>
</div>

<NewEmployeeModal bind:open {appDynamicColorTheme} {orgStructure} />
