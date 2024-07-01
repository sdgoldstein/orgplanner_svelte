<script context="module" lang="ts">
    interface NewEmployeeeModalProps extends BaseComponentProps, OrgPlannerColorThemableComponentProps {
        open: boolean;
        orgStructure: OrgStructure;
    }
</script>

<script lang="ts">
    import type { OrgPlannerColorThemableComponentProps } from "@src/components/theme";
    import Input from "@src/components/ui/forms/Input.svelte";
    import Label from "@src/components/ui/forms/Label.svelte";
    import Select from "@src/components/ui/forms/Select.svelte";
    import SelectOption from "@src/components/ui/forms/SelectOption.svelte";
    import { zExtended } from "@src/components/ui/forms/form";
    import SubmitCancelModal from "@src/components/ui/modal/SubmitCancelModal.svelte";
    import Radio from "@src/components/ui/Radio.svelte";
    import type { BaseComponentProps } from "@src/components/ui/uicomponents";
    import type { OrgStructure } from "orgplanner-common/model";

    function handleSubmit(formData:FormData): void {}
    function handleTeamChange():void{}

    let {
        open = $bindable(),
        orgStructure,
        ...restProps
    }: NewEmployeeeModalProps = $props();

</script>

<SubmitCancelModal
    bind:open
    title="New Employee"
    onsubmit={handleSubmit}
    {...restProps}
>
    <Label for="name_input_id">Name</Label>
    <Input
        id="name_input_id"
        name="name_input_name"
        placeholder="John Stevens"
        schema = {zExtended.requiredString("Name")}
    />

    <Label for="title_input_id">Title</Label>
    <Input
        id="title_input_id"
        name="title_input_name"
        placeholder="Senior Member of Staff"
        schema = {zExtended.requiredString("Title")}
    />

    <Label for="team_input_id">Team</Label>
    <Select
        id="team_input_id"
        name="team_input_name"
        onchange={handleTeamChange}
    >
        <SelectOption value="Team One">Team One</SelectOption>
        <SelectOption value="NO_TEAM_ID"
            >__ No Team __</SelectOption
        >
        <SelectOption value="<<__ New Team __>>">__ New Team __</SelectOption>
    </Select>

    <Label for="new_team_name_input" class="hidden">New Team Name</Label>
    <Input
        id="new_team_name_input_id"
        name="new_team_name_input_name"
        class="hidden"
    />

    {#each orgStructure.employeePropertyIterator() as propertyDescriptor:OrgEntityProperyDescriptor}
        <Label for="{propertyDescriptor.name}_input_id">{propertyDescriptor.title}</Label>
        <Input
            id="{propertyDescriptor.name}_input_id"
            name="{propertyDescriptor.name}_input_name"
            placeholder={propertyDescriptor.defaultValue}
        />
    {/each}

    <Label>Manager</Label>
    <div class="radio_container">
        <div>
            <Radio
                id="is_manager_yes_option_id"
                value="true"
                group="is_manager_option_name"
                checked>Yes</Radio>
        </div>
        <div>
            <Radio
                id="is_manager_no_option_id"
                value="false"
                group="iis_manager_option_name">No</Radio>
        </div>
    </div>
</SubmitCancelModal>
