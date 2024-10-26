<script module lang="ts">
	import { type OrgPlannerSettings } from "@src/model/orgPlanner";
    import { SubmitCancelModal, TabbedPane, Tab} from "@sphyrna/uicomponents";
    import { type OrgPlannerColorThemableComponentProps, AppDynamicColorThemeColorSelector, tempgetDynamicColorTheme } from "@src/components/theme";
    import type { BaseComponentProps } from "@src/components/ui/uicomponents";
   
    interface ModifySettingsModalProps extends BaseComponentProps, OrgPlannerColorThemableComponentProps {
            open: boolean;
            orgPlannerSettings:OrgPlannerSettings;
        }
    </script>
    
    <script lang="ts">
        
        function handleSubmit(formData:FormData): void 
        {
            
            open = false;
        }
    
    
        let {
            open = $bindable(false),
            orgPlannerSettings,
            appDynamicColorTheme,
            ...restProps
        }: ModifySettingsModalProps = $props();
    
        const colorVariant=AppDynamicColorThemeColorSelector.PRIMARY.toString();
        const dynamicColorTheme=tempgetDynamicColorTheme(appDynamicColorTheme);
    
    </script>
    
    <SubmitCancelModal
        id="modify_settings_modal_form_id"
        bind:open={open}    
        title="Settings"
        description="Configure Application Settings"}
        actionButtonText="Save"
        {colorVariant}
        {dynamicColorTheme}
        onsubmit={handleSubmit}
        {...restProps}
    >
        <TabbedPane {colorVariant} {dynamicColorTheme}> 
            <Tab id="color_settings_tab" label="Color">
                <!--<Label for="color_theme_option__label_id">Color Theme</Label>
                <RadioGroup id="color_theme_option_label_id" 
                            name="color_theme_option_name"         
                            {colorVariant}
                            {dynamicColorTheme}
                            value={orgPlannerSettings.colorTheme.name}>
                    {#each OrgEntityColorThemes.themeIterator() as nextColorTheme}
                    <RadioGroupOption
                        id={`${nextColorTheme.name}_option_id`}
                        value={nextColorTheme.name}
                        group="color_theme_option_name"
                        {colorVariant}
                        {dynamicColorTheme}>{nextColorTheme.label}</RadioGroupOption>
                    {/each}
                </RadioGroup>-->
            </Tab>
            <Tab id="employee_fields_settings_tab" label="Employee Fields">Fileds Stuff</Tab>
        </TabbedPane>
    </SubmitCancelModal>