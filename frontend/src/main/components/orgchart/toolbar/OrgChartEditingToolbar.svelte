<script module lang="ts">
    import { ButtonBar, IconButton } from "@sphyrna/uicomponents";
    import { OrgPlannerAppEvents } from "@src/components/app/orgPlannerAppEvents";
    import { User, Users } from "lucide-svelte";

    class OrgChartEditingToolbarEvents {
        public static readonly ADD_EMPLOYEE_TOOLBAR_ACTION: string =
            "ADD_EMPLOYEE_TOOLBAR_ACTION";
        public static readonly DELETE_ENTITY_TOOLBAR_ACTION: string =
            "DELETE_DELETE_TOOLBAR_ACTION";
        public static readonly CREATE_SNAPSHOT_TOOLBAR_ACTION: string =
            "CREATE_SNAPSHOT_TOOLBAR_ACTION";
        public static readonly MODIFY_SETTINGS_TOOLBAR_ACTION: string =
            "MODIFY_SETTINGS_TOOLBAR_ACTION";
        public static readonly SAVE_AS_IMAGE_TOOLBAR_ACTION: string =
            "SAVE_AS_IMAGE_TOOLBAR_ACTION";
        public static readonly ADD_TEAM_TOOLBAR_ACTION: string =
            "ADD_TEAM_TOOLBAR_ACTION";
    }

    interface OrgChartEditingToolbarProps
        extends OrgPlannerColorThemableComponentProps {
        orgStructure: OrgStructure;
    }

    class AddEmployeeToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgChartEditingToolbarEvents.ADD_EMPLOYEE_TOOLBAR_ACTION);
        }
    }

    class AddTeamToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgChartEditingToolbarEvents.ADD_TEAM_TOOLBAR_ACTION);
        }
    }

    class DeleteEntityToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgChartEditingToolbarEvents.DELETE_ENTITY_TOOLBAR_ACTION);
        }
    }

    class ResetPlanEvent extends BasePubSubEvent {
        constructor() {
            super(OrgPlannerAppEvents.RESET_PLAN);
        }
    }

    class CreateSnapshotToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgChartEditingToolbarEvents.CREATE_SNAPSHOT_TOOLBAR_ACTION);
        }
    }

    class SaveAsImageToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgChartEditingToolbarEvents.SAVE_AS_IMAGE_TOOLBAR_ACTION);
        }
    }

    class ModifySettingsToolbarEvent extends BasePubSubEvent {
        constructor() {
            super(OrgChartEditingToolbarEvents.MODIFY_SETTINGS_TOOLBAR_ACTION);
        }
    }

    export { OrgChartEditingToolbarEvents };
</script>

<script lang="ts">
    import {
        AppDynamicColorThemeColorSelector,
        tempgetDynamicColorTheme,
        type OrgPlannerColorThemableComponentProps,
    } from "@src/components/theme";
    import { BasePubSubEvent, PubSubManager } from "orgplanner-common/jscore";
    import type { OrgStructure } from "orgplanner-common/model";
    import { Trash2 } from "lucide-svelte";
    import { FileDown } from "lucide-svelte";
    import { Settings } from "lucide-svelte";

    let { orgStructure, appDynamicColorTheme }: OrgChartEditingToolbarProps =
        $props();

    const dynamicColorThemeMap = $derived(
        tempgetDynamicColorTheme(appDynamicColorTheme),
    );
    const colorVariant = AppDynamicColorThemeColorSelector.SECONDARY.toString();
</script>

<ButtonBar>
    <IconButton
        id="new_employee_org_chart_toolbar_button"
        dynamicColorTheme={dynamicColorThemeMap}
        {colorVariant}
        onclick={() => {
            const eventToFire = new AddEmployeeToolbarEvent();
            PubSubManager.instance.fireEvent(eventToFire);
        }}><User fill={appDynamicColorTheme.textOnPrimary} /></IconButton
    >

    <IconButton
        id="new_team_org_chart_toolbar_button"
        dynamicColorTheme={dynamicColorThemeMap}
        {colorVariant}
        onclick={() => {
            const eventToFire = new AddTeamToolbarEvent();
            PubSubManager.instance.fireEvent(eventToFire);
        }}><Users fill={appDynamicColorTheme.textOnPrimary} /></IconButton
    >

    <IconButton
        id="delete_org_chart_toolbar_button"
        dynamicColorTheme={dynamicColorThemeMap}
        {colorVariant}
        onclick={() => {
            const eventToFire = new DeleteEntityToolbarEvent();
            PubSubManager.instance.fireEvent(eventToFire);
        }}><Trash2 strokeWidth=".18rem" /></IconButton
    >

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

    <IconButton
        id="save_as_image_org_chart_toolbar_button"
        dynamicColorTheme={dynamicColorThemeMap}
        {colorVariant}
        onclick={() => {
            const eventToFire = new SaveAsImageToolbarEvent();
            PubSubManager.instance.fireEvent(eventToFire);
        }}><FileDown strokeWidth=".15rem" /></IconButton
    >

    <!--FIXME<OrgChartEditingToolbarButton symbol="preview" {appDynamicColorTheme}
    onclick={() => {
                const eventToFire = new CreateSnapshotToolbarEvent();
                PubSubManager.instance.fireEvent(eventToFire);
      }}
    ></OrgChartEditingToolbarButton>-->

    <IconButton
        id="save_as_image_org_chart_toolbar_button"
        dynamicColorTheme={dynamicColorThemeMap}
        {colorVariant}
        onclick={() => {
            const eventToFire = new ModifySettingsToolbarEvent();
            PubSubManager.instance.fireEvent(eventToFire);
        }}><Settings strokeWidth=".15rem" /></IconButton
    >
</ButtonBar>
