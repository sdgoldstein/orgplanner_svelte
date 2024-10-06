<svelte:options runes={true} />

<script module  lang="ts">
    import { OrgPlannerAppEvents } from "@src/components/app/orgPlannerAppEvents";
    import { DeleteEmployeeFromPlanEvent } from "../orgChartProxy";
    import { ButtonBar } from "@sphyrna/uicomponents";

    interface OrgChartEditingToolbarProps
        extends OrgPlannerColorThemableComponentProps {
        orgStructure: OrgStructure;
    }

    class AddEmployeeToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPlannerAppEvents.ADD_EMPLOYEE_TOOLBAR_ACTION);
        }
    }

    class ResetPlanEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPlannerAppEvents.RESET_PLAN);
        }
    }

    class CreateSnapshotToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPlannerAppEvents.CREATE_SNAPSHOT_TOOLBAR_ACTION);
        }
    }

    class SaveAsImageEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPlannerAppEvents.SAVE_AS_IMAGE);
        }
    }

    class ModifySettingsToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPlannerAppEvents.MODIFY_SETTINGS_TOOLBAR_ACTION);
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

<ButtonBar>
    <OrgChartEditingToolbarButton
        symbol="add"
        {appDynamicColorTheme}
        onclick={() => {
            const eventToFire = new AddEmployeeToolbarEvent();
            PubSubManager.instance.fireEvent(eventToFire);
        }}
    ></OrgChartEditingToolbarButton>
    <OrgChartEditingToolbarButton symbol="delete" {appDynamicColorTheme}
    onclick={() => {
      const eventToFire = new DeleteEmployeeFromPlanEvent();
      PubSubManager.instance.fireEvent(eventToFire);
    }}
    ></OrgChartEditingToolbarButton>


    <OrgChartEditingToolbarButton symbol="undo" {appDynamicColorTheme}
    onclick={() => {
        const eventToFire = new DeleteEmployeeFromPlanEvent();
        PubSubManager.instance.fireEvent(eventToFire);
      }}
    ></OrgChartEditingToolbarButton>
    <OrgChartEditingToolbarButton symbol="copy" {appDynamicColorTheme}
    onclick={() => {
        const eventToFire = new ResetPlanEvent();
        PubSubManager.instance.fireEvent(eventToFire);
      }}
    ></OrgChartEditingToolbarButton>
    <OrgChartEditingToolbarButton symbol="image" {appDynamicColorTheme}
    onclick={() => {
      const eventToFire = new CreateSnapshotToolbarEvent();
      PubSubManager.instance.fireEvent(eventToFire);
      }}
    ></OrgChartEditingToolbarButton>
    <OrgChartEditingToolbarButton symbol="preview" {appDynamicColorTheme}
    onclick={() => {
                const eventToFire = new SaveAsImageEvent();
                PubSubManager.instance.fireEvent(eventToFire);
      }}
    ></OrgChartEditingToolbarButton>
    <OrgChartEditingToolbarButton symbol="settings" {appDynamicColorTheme}
    onclick={() => {
        const eventToFire = new ModifySettingsToolbarEvent();
        PubSubManager.instance.fireEvent(eventToFire);
      }}
    ></OrgChartEditingToolbarButton>
</ButtonBar>
