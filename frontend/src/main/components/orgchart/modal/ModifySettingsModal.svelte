<script module lang="ts">
    import {
        OrgPlannerSettingsDefaultImpl,
        type OrgPlannerSettings,
    } from "@src/model/orgPlanner";
    import {
        SubmitCancelModal,
        TabbedPane,
        Tab,
        Label,
        Checkbox,
        RadioGroup,
        RadioGroupOption,
    } from "@sphyrna/uicomponents";
    import {
        type OrgPlannerColorThemableComponentProps,
        AppDynamicColorThemeColorSelector,
        tempgetDynamicColorTheme,
    } from "@src/components/theme";
    import type { BaseComponentProps } from "@src/components/ui/uicomponents";
    import { OrgEntityColorThemes } from "orgplanner-common/model";
    import { ChangeSettingsActionEvent } from "@src/components/app/orgPlannerAppEvents";
    import { PubSubManager } from "orgplanner-common/jscore";
    import ColorPicker from "svelte-awesome-color-picker";

    interface ModifySettingsModalProps
        extends BaseComponentProps,
            OrgPlannerColorThemableComponentProps {
        open: boolean;
        orgPlannerSettings: OrgPlannerSettings;
    }
</script>

<script lang="ts">
    function handleSubmit(formData: FormData): void {
        const colorThemeElement: FormDataEntryValue | null = formData.get(
            "color_theme_option_name",
        );

        if (!colorThemeElement) {
            throw new Error("Could not obtain form elements");
        }

        const changedColorScheme = OrgEntityColorThemes.getColorThemeByName(
            colorThemeElement.valueOf() as string,
        );
        const changedOrgPlannerSettings = new OrgPlannerSettingsDefaultImpl(
            orgPlannerSettings.employeePropertyDescriptors,
            changedColorScheme,
        );

        const eventToFire: ChangeSettingsActionEvent =
            new ChangeSettingsActionEvent(changedOrgPlannerSettings);

        PubSubManager.instance.fireEvent(eventToFire);
        open = false;
    }

    let {
        open = $bindable(false),
        orgPlannerSettings,
        appDynamicColorTheme,
        ...restProps
    }: ModifySettingsModalProps = $props();

    const colorVariant = AppDynamicColorThemeColorSelector.PRIMARY.toString();
    const dynamicColorTheme = $derived(
        tempgetDynamicColorTheme(appDynamicColorTheme),
    );

    let selectedTheme = $state(orgPlannerSettings.colorTheme.name);
    let showCustomThemeInput = $derived(
        selectedTheme == "color_theme_option" ? true : false,
    );
</script>

<SubmitCancelModal
    id="modify_settings_modal_form_id"
    bind:open
    title="Settings"
    description="Configure Application Settings"
    }
    actionButtonText="Save"
    {colorVariant}
    {dynamicColorTheme}
    onsubmit={handleSubmit}
    {...restProps}
>
    <TabbedPane {colorVariant} {dynamicColorTheme}>
        <Tab id="color_settings_tab" label="Color">
            <Label for="color_theme_option_label_id">Color Theme</Label>
            <RadioGroup
                id="color_theme_option_label_id"
                name="color_theme_option_name"
                {colorVariant}
                {dynamicColorTheme}
                bind:value={selectedTheme}
            >
                {#each OrgEntityColorThemes.themeIterator() as nextColorTheme}
                    <RadioGroupOption
                        id={`${nextColorTheme.name}_option_id`}
                        value={nextColorTheme.name}
                        group="color_theme_option_name"
                        {colorVariant}
                        {dynamicColorTheme}
                        >{nextColorTheme.label}</RadioGroupOption
                    >
                {/each}
                <RadioGroupOption
                    id={`custom_color_option_id`}
                    value="color_theme_option"
                    group="color_theme_option_name"
                    {colorVariant}
                    {dynamicColorTheme}>Custom</RadioGroupOption
                >
                {#if showCustomThemeInput}
                    <div class="flex flex-col">
                        <ColorPicker
                            id="custom_color_manager_option_id"
                            name="custom_color_manager_option_name"
                            label="Manager"
                            position="responsive"
                        />
                        <ColorPicker
                            id="custom_color_ic_option_id"
                            name="custom_color_ic_option_name"
                            label="Individual Contributor"
                            position="responsive"
                        />
                        <ColorPicker
                            id="custom_color_team_option_id"
                            name="custom_color_team_option_name"
                            label="Team"
                            position="responsive"
                        />
                    </div>
                {/if}
            </RadioGroup>
        </Tab>
        <Tab id="employee_fields_settings_tab" label="Employee Fields">
            <div class="flex flex-col">
                <Checkbox id="name-input-id" disabled checked
                    >Name (required)</Checkbox
                >
                <Checkbox type="checkbox" id="title-input-id" disabled checked
                    >Title (required)</Checkbox
                >
                {#each orgPlannerSettings.employeePropertyDescriptors as nextPropertyDescriptor}
                    <Checkbox
                        id={`${nextPropertyDescriptor.name}-input-id`}
                        checked={nextPropertyDescriptor.enabled}
                        >{nextPropertyDescriptor.title}</Checkbox
                    >
                {/each}
            </div>
        </Tab>
    </TabbedPane>
</SubmitCancelModal>
