<svelte:options runes={true} />

<script module  lang="ts">
    import { ButtonBar } from "@sphyrna/uicomponents";
    import { OrgPlannerAppEvents } from "@src/components/app/orgPlannerAppEvents";

    interface OrgChartEditingToolbarProps
        extends OrgPlannerColorThemableComponentProps {
        orgStructure: OrgStructure;
    }

    class AddEmployeeToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPageEvents.ADD_EMPLOYEE_TOOLBAR_ACTION);
        }
    }

    class DeleteEmployeeToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPageEvents.DELETE_EMPLOYEE_TOOLBAR_ACTION);
        }
    }

    class ResetPlanEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPlannerAppEvents.RESET_PLAN);
        }
    }

    class CreateSnapshotToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPageEvents.CREATE_SNAPSHOT_TOOLBAR_ACTION);
        }
    }

    class SaveAsImageToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPageEvents.SAVE_AS_IMAGE_TOOLBAR_ACTION);
        }
    }

    class ModifySettingsToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPageEvents.MODIFY_SETTINGS_TOOLBAR_ACTION);
        }
    } 
</script>

<script lang="ts">
    import OrgChartEditingToolbarButton from "./OrgChartEditingToolbarButton.svelte";
    import type { OrgPlannerColorThemableComponentProps } from "@src/components/theme";
    import { BasePubSubEvent, PubSubManager } from "orgplanner-common/jscore";
    import type { OrgStructure } from "orgplanner-common/model";
    import { OrgPageEvents } from "@src/components/page/orgPageEvents";

    let { orgStructure, appDynamicColorTheme }: OrgChartEditingToolbarProps =
        $props();
</script>

<ButtonBar>
    <OrgChartEditingToolbarButton
        id="new_employee_org_chart_toolbar_button"
        symbol="add"
        {appDynamicColorTheme}
        onclick={() => {
            const eventToFire = new AddEmployeeToolbarEvent();
            PubSubManager.instance.fireEvent(eventToFire);
        }}
    ></OrgChartEditingToolbarButton>
    <OrgChartEditingToolbarButton symbol="delete" {appDynamicColorTheme}
    onclick={() => {
      const eventToFire = new DeleteEmployeeToolbarEvent();
      PubSubManager.instance.fireEvent(eventToFire);
    }}
    ></OrgChartEditingToolbarButton>


    <!--FIXME <OrgChartEditingToolbarButton symbol="undo" {appDynamicColorTheme}
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
    ></OrgChartEditingToolbarButton>-->
    <OrgChartEditingToolbarButton   id="save_as_image_org_chart_toolbar_button"
    symbol="image" {appDynamicColorTheme}
    onclick={() => {
      const eventToFire = new SaveAsImageToolbarEvent();
      PubSubManager.instance.fireEvent(eventToFire);
      }}
    ></OrgChartEditingToolbarButton>
    <!--FIXME<OrgChartEditingToolbarButton symbol="preview" {appDynamicColorTheme}
    onclick={() => {
                const eventToFire = new CreateSnapshotToolbarEvent();
                PubSubManager.instance.fireEvent(eventToFire);
      }}
    ></OrgChartEditingToolbarButton>-->
    <OrgChartEditingToolbarButton symbol="settings" {appDynamicColorTheme}
    onclick={() => {
        const eventToFire = new ModifySettingsToolbarEvent();
        PubSubManager.instance.fireEvent(eventToFire);
      }}
    ></OrgChartEditingToolbarButton>
</ButtonBar>
