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
    import {
        DefaultOrgEntityColorThemeImpl,
        OrgEntityColorThemes,
        ColorPairingImpl,
        OrgEntityTypes,
        type ColorHex,
    } from "orgplanner-common/model";
    import { ChangeSettingsActionEvent } from "@src/components/app/orgPlannerAppEvents";
    import { PubSubManager } from "orgplanner-common/jscore";
    import ColorPicker from "svelte-awesome-color-picker";

    interface ModifySettingsModalProps
        extends OrgPlannerColorThemableComponentProps {
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

        let changedColorScheme;
        if (colorThemeElement == "custom_color_theme_option") {
            const managerColor: FormDataEntryValue | null = formData.get(
                "custom_color_manager_option_name",
            );
            const teamColor: FormDataEntryValue | null = formData.get(
                "custom_color_team_option_name",
            );
            const icColor: FormDataEntryValue | null = formData.get(
                "custom_color_ic_option_name",
            );
            const accentColor: FormDataEntryValue | null = formData.get(
                "custom_color_accent_option_name",
            );

            if (!managerColor || !teamColor || !icColor || !accentColor) {
                throw new Error("Custom Color Pickers not found");
            }

            changedColorScheme = new DefaultOrgEntityColorThemeImpl(
                "custom_color_theme_option",
                "Custom",
                new ColorPairingImpl(accentColor as ColorHex, "#FFFFFF"),
            );
            changedColorScheme.setColorAssignment(
                OrgEntityTypes.MANAGER,
                new ColorPairingImpl(managerColor as ColorHex, "#FFFFFF"),
            );
            changedColorScheme.setColorAssignment(
                OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR,
                new ColorPairingImpl(icColor as ColorHex, "#FFFFFF"),
            );
            changedColorScheme.setColorAssignment(
                OrgEntityTypes.TEAM,
                new ColorPairingImpl(teamColor as ColorHex, "#FFFFFF"),
            );
        } else {
            changedColorScheme = OrgEntityColorThemes.getColorThemeByName(
                colorThemeElement.valueOf() as string,
            );
        }
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
        selectedTheme == "custom_color_theme_option" ? true : false,
    );
</script>

<SubmitCancelModal
    id="modify_settings_modal_form_id"
    bind:open
    title="Settings"
    description="Configure Application Settings"
    actionButtonText="Save"
    {colorVariant}
    {dynamicColorTheme}
    onsubmit={handleSubmit}
    {...restProps}
>
    <TabbedPane
        selectedTab="color_settings_tab_name"
        {colorVariant}
        {dynamicColorTheme}
    >
        <Tab
            id="color_settings_tab_id"
            name="color_settings_tab_name"
            label="Color"
        >
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
                        {colorVariant}
                        {dynamicColorTheme}
                        >{nextColorTheme.label}</RadioGroupOption
                    >
                {/each}
                <RadioGroupOption
                    id={`custom_color_option_id`}
                    value="custom_color_theme_option"
                    {colorVariant}
                    {dynamicColorTheme}>Custom</RadioGroupOption
                >
                {#if showCustomThemeInput}
                    <div class="flex flex-col">
                        <ColorPicker
                            id="custom_color_team_option_id"
                            name="custom_color_team_option_name"
                            label="Team"
                            position="responsive"
                            hex={orgPlannerSettings.colorTheme.getColorAssignment(
                                OrgEntityTypes.TEAM,
                            ).primary}
                        />
                        <ColorPicker
                            id="custom_color_manager_option_id"
                            name="custom_color_manager_option_name"
                            label="Manager"
                            position="responsive"
                            hex={orgPlannerSettings.colorTheme.getColorAssignment(
                                OrgEntityTypes.MANAGER,
                            ).primary}
                        />
                        <ColorPicker
                            id="custom_color_ic_option_id"
                            name="custom_color_ic_option_name"
                            label="Individual Contributor"
                            position="responsive"
                            hex={orgPlannerSettings.colorTheme.getColorAssignment(
                                OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR,
                            ).primary}
                        />
                        <ColorPicker
                            id="custom_color_accent_option_id"
                            name="custom_color_accent_option_name"
                            label="Action"
                            position="responsive"
                            hex={orgPlannerSettings.colorTheme.accentColor
                                .primary}
                        />
                    </div>
                {/if}
            </RadioGroup>
        </Tab>
        <Tab
            id="employee_fields_settings_tab_id"
            name="employee_fields_settings_tab_name"
            label="Employee Fields"
        >
            <div class="flex flex-col">
                <Checkbox
                    id="name-input-id"
                    name="name-input-name"
                    disabled
                    checked>Name (required)</Checkbox
                >
                <Checkbox
                    id="title-input-id"
                    name="title-input-name"
                    disabled
                    checked>Title (required)</Checkbox
                >
                {#each orgPlannerSettings.employeePropertyDescriptors as nextPropertyDescriptor}
                    <Checkbox
                        id={`${nextPropertyDescriptor.name}-input-id`}
                        name={`${nextPropertyDescriptor.name}-input-name`}
                        checked={nextPropertyDescriptor.enabled}
                        >{nextPropertyDescriptor.title}</Checkbox
                    >
                {/each}
            </div>
        </Tab>
    </TabbedPane>
</SubmitCancelModal>
