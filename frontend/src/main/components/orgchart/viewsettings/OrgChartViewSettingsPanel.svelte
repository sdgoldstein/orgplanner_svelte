<script lang="ts" module>
    import { Checkbox, Form } from "@sphyrna/uicomponents";
    import {
        AppDynamicColorThemeColorSelector,
        tempgetDynamicColorTheme,
        type OrgPlannerColorThemableComponentProps,
    } from "@src/components/theme";
    import type { OrgPlannerSettings } from "@src/model/orgPlanner";
    import { PubSubManager } from "orgplanner-common/jscore";
    import { OrgEntityTypes } from "orgplanner-common/model";
    import {
        ViewToggableEntityToggledEvent,
        type ViewToggableEntity,
    } from "orgplanner-orgchart";

    export interface OrgChartViewSettingsPanelProps
        extends OrgPlannerColorThemableComponentProps {
        settings: OrgPlannerSettings;
    }
</script>

<script lang="ts">
    let { settings, appDynamicColorTheme }: OrgChartViewSettingsPanelProps =
        $props();
    const dynamicColorTheme = $derived(
        tempgetDynamicColorTheme(appDynamicColorTheme),
    );
    const colorVariant = AppDynamicColorThemeColorSelector.SECONDARY.toString();

    function toggleVisibility(entity: ViewToggableEntity, isVisibile: boolean) {
        const visibilityChangeEvent = new ViewToggableEntityToggledEvent(
            entity,
            isVisibile,
        );
        PubSubManager.instance.fireEvent(visibilityChangeEvent);
    }
</script>

<Form id="orglist_form">
    <div class="flex flex-col p-2">
        <Checkbox
            id="teamVisibilityCheckbox_input_id"
            name="teamVisibilityCheckbox_name_id"
            {colorVariant}
            {dynamicColorTheme}
            onValueChange={(checked) => {
                toggleVisibility(OrgEntityTypes.TEAM, checked);
            }}>Show/Hide Teams</Checkbox
        >
        <Checkbox
            id="managerVisibilityCheckbox_input_id"
            name="managerVisibilityCheckbox_name_id"
            {colorVariant}
            {dynamicColorTheme}
            checked
            onValueChange={(checked) => {
                toggleVisibility(OrgEntityTypes.MANAGER, checked);
            }}>Show/Hide Managers</Checkbox
        >
        <Checkbox
            id="icVisibilityCheckbox_input_id"
            name="icVisibilityCheckbox_name_id"
            {colorVariant}
            {dynamicColorTheme}
            checked
            onValueChange={(checked) => {
                toggleVisibility(
                    OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR,
                    checked,
                );
            }}>Show/Hide ICs</Checkbox
        >
        <Checkbox
            id="titleVisibilityCheckbox_input_id"
            name="titleVisibilityCheckbox_name_id"
            {colorVariant}
            checked
            {dynamicColorTheme}
            onValueChange={(checked) => {
                toggleVisibility(
                    FixedOrgEntityPropertyDescriptors.TITLE,
                    checked,
                );
            }}>Show/Hide Title Property</Checkbox
        >
        <Checkbox
            id="teamPropertyVisibilityCheckbox_input_id"
            name="teamPropertyVisibilityCheckbox_name_id"
            {colorVariant}
            checked
            {dynamicColorTheme}
            onValueChange={(checked) => {
                toggleVisibility(
                    FixedOrgEntityPropertyDescriptors.TEAM_TITLE,
                    checked,
                );
            }}>Show/Hide Team Property</Checkbox
        >
        {#each settings.employeePropertyDescriptors as nextPropertyDescriptor: OrgEntityPropertyDescriptor}
            <Checkbox
                id={`${nextPropertyDescriptor.title}PropertyVisibilityCheckbox_input_id`}
                name={`${nextPropertyDescriptor.title}PropertyVisibilityCheckbox_name_id`}
                {colorVariant}
                {dynamicColorTheme}
                checked
                onValueChange={(checked) => {
                    toggleVisibility(nextPropertyDescriptor, checked);
                }}>Show/Hide {nextPropertyDescriptor.title}</Checkbox
            >
        {/each}
    </div>
</Form>
