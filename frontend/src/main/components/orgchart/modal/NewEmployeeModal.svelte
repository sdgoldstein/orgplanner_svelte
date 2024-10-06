<script module  lang="ts">

class NewEmployeeEvent extends BasePubSubEvent
{
    // Shorthand declaring these in constuctor didn't work within svelte
    name:string;
    title:string;
    managerId: string;
    teamId: string;
    isManager: boolean;
    properties: OrgEntityPropertyBag;

    constructor(name: string, title: string,  managerId: string,  teamId: string, isManager: boolean, properties: OrgEntityPropertyBag)
    {
        super(OrgPlannerAppEvents.ADD_EMPLOYEE);
        this.name=name;
        this.title=title;
        this.managerId=managerId;
        this.teamId=teamId;
        this.isManager=isManager;
        this.properties=properties;
    }
}

interface NewEmployeeeModalProps extends BaseComponentProps, OrgPlannerColorThemableComponentProps {
        open: boolean;
        orgStructure: OrgStructure;
        managerId:string;
    }

    export {NewEmployeeEvent};
</script>

<script lang="ts">
    import { AppDynamicColorThemeColorSelector, tempgetDynamicColorTheme, type OrgPlannerColorThemableComponentProps } from "@src/components/theme";
    import { zExtended } from "@src/components/ui/forms/form";
    import type { OrgEntityPropertyBag, OrgEntityPropertyDescriptor, OrgStructure } from "orgplanner-common/model";
    import { BasePubSubEvent, PubSubManager } from "orgplanner-common/jscore";
    import { Input, Label, Select, SelectOption, RadioGroup, RadioGroupOption, SubmitCancelModal } from "@sphyrna/uicomponents";
    import type { BaseComponentProps } from "@src/components/ui/uicomponents";
    import { OrgPlannerAppEvents } from "@src/components/app/orgPlannerAppEvents";

    function handleSubmit(formData:FormData): void 
    {
        const nameElement: FormDataEntryValue | null = formData.get("name_input_name");
        const titleElement: FormDataEntryValue | null = formData.get("title_input_name");
        const teamElement: FormDataEntryValue | null = formData.get("team_input_name");
        const isManagerElement: FormDataEntryValue | null = formData.get("is_manager_option_name");

        if (!nameElement || !titleElement || !teamElement || !isManagerElement)
        {
            throw new Error("Could not obtain form elements");
        }

        let teamId: string = teamElement.valueOf() as string;
        if (teamId === "<<-- New Team -->>")
        {
            const newTeamTitle: FormDataEntryValue | null = formData.get("new_team_name_input_name");
            if (!newTeamTitle)
            {
                throw new Error("Could not obtain new team title form element");
            }

            const createdTeam = orgStructure.createTeam(newTeamTitle.valueOf() as string, managerId);
            teamId = createdTeam.id;
        }

        const properties: OrgEntityPropertyBag = new Map<OrgEntityPropertyDescriptor, string>();
        for (const propertyDescriptor of orgStructure.employeePropertyIterator())
        {
            const propertyElement: FormDataEntryValue | null = formData.get(`${propertyDescriptor.name}_input_name`);
            if (propertyElement === null)
            {
                throw new Error("Could not find element for property, " + propertyDescriptor.name);
            }
            properties.set(propertyDescriptor, propertyElement.valueOf() as string);
        }

        const eventToFire = new NewEmployeeEvent(nameElement.valueOf() as string, titleElement.valueOf() as string, managerId,
        teamId, isManagerElement.valueOf() as boolean, properties)
        PubSubManager.instance.fireEvent(eventToFire);

        open = false;
    }


    let {
        open = $bindable(),
        orgStructure,
        managerId= $bindable(),
        appDynamicColorTheme,
        ...restProps
    }: NewEmployeeeModalProps = $props();

    let selectedTeam:{value:any,label:string}|undefined = $state();
    let showNewTeamNameInput = $derived((selectedTeam && selectedTeam.value=="<<-- New Team -->>") ? true : false );

    const colorVariant=AppDynamicColorThemeColorSelector.PRIMARY.toString();
    const dynamicColorTheme=tempgetDynamicColorTheme(appDynamicColorTheme);
</script>

<SubmitCancelModal
    bind:open={open}    
    title="New Employee"
    description="Create a new employee"
    actionButtonText="Create"
    {colorVariant}
    {dynamicColorTheme}
    onsubmit={handleSubmit}
    {...restProps}
>
    <Label for="name_input_id">Name</Label>
    <Input
        id="name_input_id"
        name="name_input_name"
        placeholder="John Stevens"
        schema = {zExtended.requiredString("Name")}
        {colorVariant}
        {dynamicColorTheme}
    />

    <Label for="title_input_id">Title</Label>
    <Input
        id="title_input_id"
        name="title_input_name"
        placeholder="Senior Member of Staff"
        schema = {zExtended.requiredString("Title")}
        {colorVariant}
        {dynamicColorTheme}
    />

    <Label for="team_input_id">Team</Label>
    <Select
        id="team_input_id"
        name="team_input_name"
        placeholder="Select a Team"
        bind:selected={selectedTeam}
        {colorVariant}
        {dynamicColorTheme}
    >
        {#each orgStructure.getTeams() as nextTeam:Team}
            <SelectOption value={nextTeam.id}>{nextTeam.title}</SelectOption>
        {/each}

        <SelectOption value="<<-- New Team -->>">-- New Team --</SelectOption>
    </Select>

    {#if showNewTeamNameInput}
        <Label for="new_team_name_input">New Team Name</Label>
        <Input
            id="new_team_name_input_id"
            name="new_team_name_input_name"
            placeholder="New Team Name"
            {colorVariant}
            {dynamicColorTheme}
        />
    {/if}

    {#each orgStructure.employeePropertyIterator() as propertyDescriptor:OrgEntityProperyDescriptor}
        <Label for="{propertyDescriptor.name}_input_id">{propertyDescriptor.title}</Label>
        <Input
            id="{propertyDescriptor.name}_input_id"
            name="{propertyDescriptor.name}_input_name"
            placeholder={propertyDescriptor.defaultValue}
            {colorVariant}
            {dynamicColorTheme}
        />
    {/each}

    <Label for="is_manager_option_id">Manager</Label>
    <RadioGroup id="is_manager_option_id" 
                name="is_manager_option_name"         
                {colorVariant}
                {dynamicColorTheme}
                value="true">
            <RadioGroupOption
                id="is_manager_yes_option_id"
                value="true"
                group="is_manager_option_name"
                {colorVariant}
                {dynamicColorTheme}>Yes</RadioGroupOption>
            <RadioGroupOption
                id="is_manager_no_option_id"
                value="false"
                group="iis_manager_option_name"
                {colorVariant}
                {dynamicColorTheme}>No</RadioGroupOption>
</RadioGroup>
</SubmitCancelModal>
