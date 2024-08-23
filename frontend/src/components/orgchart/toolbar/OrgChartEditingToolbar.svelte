<svelte:options runes={true} />

<script context="module" lang="ts">
    import { OrgPlannerAppEvents } from "@src/components/app/orgPlannerAppEvents";

    interface OrgChartEditingToolbarProps
        extends OrgPlannerColorThemableComponentProps {
        orgStructure: OrgStructure;
    }

    class AddEmployeeToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPlannerAppEvents.ADD_EMPLOYEE_TOOLBAR_ACTION);
        }
    }

    class DeleteEmployeeFromPlanEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPlannerAppEvents.DELETE_EMPLOYEE_FROM_PLAN);
        }
    }

    class ResetPlanEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPlannerAppEvents.RESET_PLAN);
        }
    }

    class SaveAsImageEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPlannerAppEvents.SAVE_AS_IMAGE);
        }
    }
</script>

<script lang="ts">
    import OrgChartEditingToolbarButton from "./OrgChartEditingToolbarButton.svelte";
    import type { OrgPlannerColorThemableComponentProps } from "@src/components/theme";
    import { BasePubSubEvent, PubSubManager } from "orgplanner-common/jscore";
    import type { OrgStructure } from "orgplanner-common/model";

    let { orgStructure, appDynamicColorTheme }: OrgChartEditingToolbarProps =
        $props();
</script>

<div class="fixed z-40 mt-1 ml-1">
    <OrgChartEditingToolbarButton
        symbol="add"
        {appDynamicColorTheme}
        onclick={() => {
            const eventToFire = new AddEmployeeToolbarEvent();
            PubSubManager.instance.fireEvent(eventToFire);
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
