<script module lang="ts">
    import {
        AppDynamicColorThemeColorSelector,
        tempgetDynamicColorTheme,
        type OrgPlannerColorThemableComponentProps,
    } from "@src/components/theme";

    interface NewEditTeamModalProps
        extends OrgPlannerColorThemableComponentProps {
        open: boolean;
        teamToEdit?: Team;
        managerId: string;
        mode: RecordModalMode;
    }
</script>

<script lang="ts">
    import {
        SubmitCancelModal,
        Input,
        Label,
        zExtended,
    } from "@sphyrna/uicomponents";
    import { PubSubManager } from "orgplanner-common/jscore";
    import {
        EditTeamEvent,
        NewTeamEvent,
    } from "@src/components/page/orgPageEvents";
    import { RecordModalModes, type RecordModalMode } from "./modal";
    import type { Team } from "orgplanner-common/model";

    function handleSubmit(formData: FormData): void {
        const teamName: FormDataEntryValue | null = formData.get(
            "new_team_title_input_name",
        );
        if (!teamName) {
            throw Error("teamName not found in form data");
        }

        let eventToFire;
        if (mode == RecordModalModes.EDIT && teamToEdit) {
            eventToFire = new EditTeamEvent(
                teamName.valueOf() as string,
                teamToEdit,
            );
        } else {
            eventToFire = new NewTeamEvent(teamName.valueOf() as string);
        }

        PubSubManager.instance.fireEvent(eventToFire);

        open = false;
    }

    let {
        open = $bindable(false),
        appDynamicColorTheme,
        managerId = $bindable(),
        mode = $bindable(RecordModalModes.NEW),
        teamToEdit = $bindable(),
        ...restProps
    }: NewEditTeamModalProps = $props();

    const colorVariant = AppDynamicColorThemeColorSelector.PRIMARY.toString();
    const dynamicColorTheme = $derived(
        tempgetDynamicColorTheme(appDynamicColorTheme),
    );
</script>

<SubmitCancelModal
    id="new_team_modal"
    bind:open
    title="New Team"
    description="Please enter a title for the new team."
    actionButtonText="Create"
    {colorVariant}
    {dynamicColorTheme}
    onsubmit={handleSubmit}
    {...restProps}
>
    <Label for="new_team_title_input_id">Title</Label>
    <Input
        id="new_team_title_input_id"
        name="new_team_title_input_name"
        placeholder="New Team"
        schema={zExtended.requiredString("Team")}
        {colorVariant}
        {dynamicColorTheme}
    />
</SubmitCancelModal>
