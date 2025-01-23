<script module lang="ts">
    type NewEditEmployeeModalMode = "Edit" | "New";
    class NewEditEmployeeModalModes {
        static readonly EDIT: NewEditEmployeeModalMode = "Edit";
        static readonly NEW: NewEditEmployeeModalMode = "New";
    }
    interface NewEditEmployeeModalProps
        extends BaseComponentProps,
            OrgPlannerColorThemableComponentProps {
        open: boolean;
        orgStructure: OrgStructure;
        managerId: string;
        employeeToEdit?: Employee;
        mode: NewEditEmployeeModalMode;
    }

    export { NewEditEmployeeModalModes };
    export type { NewEditEmployeeModalMode };
</script>

<script lang="ts">
    import {
        AppDynamicColorThemeColorSelector,
        tempgetDynamicColorTheme,
        type OrgPlannerColorThemableComponentProps,
    } from "@src/components/theme";
    import type {
        Employee,
        OrgEntityPropertyBag,
        OrgEntityPropertyDescriptor,
        OrgStructure,
    } from "orgplanner-common/model";
    import { PubSubManager } from "orgplanner-common/jscore";
    import {
        Input,
        Label,
        Select,
        SelectOption,
        RadioGroup,
        RadioGroupOption,
        SubmitCancelModal,
        zExtended,
    } from "@sphyrna/uicomponents";
    import {
        EditEmployeeEvent,
        NewEmployeeAndTeamEvent,
        NewEmployeeEvent,
    } from "@src/components/page/orgPageEvents";

    function handleSubmit(formData: FormData): void {
        const nameElement: FormDataEntryValue | null =
            formData.get("name_input_name");
        const titleElement: FormDataEntryValue | null =
            formData.get("title_input_name");
        const teamElement: FormDataEntryValue | null =
            formData.get("team_input_name");
        const isManagerElement: FormDataEntryValue | null = formData.get(
            "is_manager_option_name",
        );

        if (
            !nameElement ||
            !titleElement ||
            (!teamElement &&
                (mode === NewEditEmployeeModalModes.NEW ||
                    employeeToEdit !== undefined)) ||
            (!isManagerElement && mode === NewEditEmployeeModalModes.NEW)
        ) {
            throw new Error("Could not obtain form elements");
        }

        let teamId: string;
        if (
            mode === NewEditEmployeeModalModes.EDIT &&
            employeeToEdit !== undefined
        ) {
            teamId = employeeToEdit.team.id;
        } else {
            if (!teamElement) {
                // This should have already been checked above
                throw new Error("Could not obtain team form element");
            }
            teamId = teamElement.valueOf() as string;
        }

        const properties: OrgEntityPropertyBag = new Map<
            OrgEntityPropertyDescriptor,
            string
        >();
        for (const propertyDescriptor of orgStructure.employeePropertyIterator()) {
            const propertyElement: FormDataEntryValue | null = formData.get(
                `${propertyDescriptor.name}_input_name`,
            );
            if (propertyElement === null) {
                throw new Error(
                    "Could not find element for property, " +
                        propertyDescriptor.name,
                );
            }
            properties.set(
                propertyDescriptor.name,
                propertyElement.valueOf() as string,
            );
        }

        let eventToFire;
        if (mode == NewEditEmployeeModalModes.NEW) {
            if (teamId === "<<-- New Team -->>") {
                const newTeamTitle: FormDataEntryValue | null = formData.get(
                    "new_team_name_input_name",
                );
                if (!newTeamTitle) {
                    throw new Error(
                        "Could not obtain new team title form element",
                    );
                }

                eventToFire = new NewEmployeeAndTeamEvent(
                    nameElement.valueOf() as string,
                    titleElement.valueOf() as string,
                    managerId,
                    isManagerElement.valueOf() === "true",
                    properties,
                    newTeamTitle.valueOf() as string,
                );
            } else {
                eventToFire = new NewEmployeeEvent(
                    nameElement.valueOf() as string,
                    titleElement.valueOf() as string,
                    managerId,
                    teamId,
                    isManagerElement.valueOf() === "true",
                    properties,
                );
            }
        } else if (mode == NewEditEmployeeModalModes.EDIT && employeeToEdit) {
            eventToFire = new EditEmployeeEvent(
                nameElement.valueOf() as string,
                titleElement.valueOf() as string,
                teamId,
                properties,
                employeeToEdit,
            );
        } else {
            throw new Error("Invalid mode and state");
        }

        PubSubManager.instance.fireEvent(eventToFire);

        open = false;
    }

    let {
        open = $bindable(false),
        mode = $bindable(NewEditEmployeeModalModes.NEW),
        orgStructure,
        managerId = $bindable(),
        employeeToEdit = $bindable(),
        appDynamicColorTheme,
        ...restProps
    }: NewEditEmployeeModalProps = $props();

    let selectedTeam: { value: any; label: string } | undefined =
        $state(undefined);
    let showNewTeamNameInput = $derived(
        selectedTeam && selectedTeam.value == "<<-- New Team -->>"
            ? true
            : false,
    );

    const colorVariant = AppDynamicColorThemeColorSelector.PRIMARY.toString();
    const dynamicColorTheme = $derived(
        tempgetDynamicColorTheme(appDynamicColorTheme),
    );

    $effect.pre(() => {
        selectedTeam =
            mode == NewEditEmployeeModalModes.EDIT && employeeToEdit
                ? {
                      value: employeeToEdit.team.id,
                      label: employeeToEdit.team.title,
                  }
                : undefined;
    });
</script>

<SubmitCancelModal
    id="new_edit_employee_modal_form_id"
    bind:open
    title={mode == NewEditEmployeeModalModes.NEW
        ? "New Employee"
        : "Edit Employee"}
    description={mode == NewEditEmployeeModalModes.NEW
        ? "Create a new employee"
        : "Edit the selected employee"}
    actionButtonText={mode == NewEditEmployeeModalModes.NEW ? "Create" : "Save"}
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
        value={mode == NewEditEmployeeModalModes.EDIT && employeeToEdit
            ? employeeToEdit.name
            : undefined}
        schema={zExtended.requiredString("Name")}
        {colorVariant}
        {dynamicColorTheme}
    />

    <Label for="title_input_id">Title</Label>
    <Input
        id="title_input_id"
        name="title_input_name"
        placeholder="Senior Member of Staff"
        value={mode == NewEditEmployeeModalModes.EDIT && employeeToEdit
            ? employeeToEdit.title
            : undefined}
        schema={zExtended.requiredString("Title")}
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
        disabled={mode == NewEditEmployeeModalModes.EDIT && employeeToEdit}
    >
        {#each orgStructure.getTeams() as nextTeam: Team}
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

    {#each orgStructure.employeePropertyIterator() as propertyDescriptor: OrgEntityProperyDescriptor}
        <Label for="{propertyDescriptor.name}_input_id"
            >{propertyDescriptor.title}</Label
        >
        <Input
            id="{propertyDescriptor.name}_input_id"
            name="{propertyDescriptor.name}_input_name"
            placeholder={propertyDescriptor.defaultValue}
            value={mode == NewEditEmployeeModalModes.EDIT && employeeToEdit
                ? employeeToEdit.getPropertyValue(propertyDescriptor.name)
                : undefined}
            {colorVariant}
            {dynamicColorTheme}
        />
    {/each}

    <!-- FIXME - Need to make readonly when editing employee-->
    <Label for="is_manager_option_id">Manager</Label>
    <RadioGroup
        id="is_manager_option_id"
        name="is_manager_option_name"
        {colorVariant}
        {dynamicColorTheme}
        value={mode == NewEditEmployeeModalModes.EDIT && employeeToEdit
            ? employeeToEdit.isManager().toString()
            : "true"}
        disabled={mode == NewEditEmployeeModalModes.EDIT}
    >
        <RadioGroupOption
            id="is_manager_yes_option_id"
            value="true"
            group="is_manager_option_name"
            {colorVariant}
            {dynamicColorTheme}
            disabled={mode == NewEditEmployeeModalModes.EDIT}
            >Yes</RadioGroupOption
        >
        <RadioGroupOption
            id="is_manager_no_option_id"
            value="false"
            group="is_manager_option_name"
            {colorVariant}
            {dynamicColorTheme}
            disabled={mode == NewEditEmployeeModalModes.EDIT}
            >No</RadioGroupOption
        >
    </RadioGroup>
</SubmitCancelModal>
