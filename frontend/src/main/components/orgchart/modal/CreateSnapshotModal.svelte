<script module lang="ts">
    import {
        AppDynamicColorThemeColorSelector,
        tempgetDynamicColorTheme,
        type OrgPlannerColorThemableComponentProps,
    } from "@src/components/theme";

    interface CreateSnapshotModalProps
        extends OrgPlannerColorThemableComponentProps {
        open: boolean;
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
    import { CreateSnapshotEvent } from "@src/components/page/orgPageEvents";

    function handleSubmit(formData: FormData): void {
        const snapshotName: FormDataEntryValue | null = formData.get(
            "snapshot_name_input_name",
        );
        if (!snapshotName) {
            throw Error("snapshotName not found in form data");
        }

        open = false;
        const eventToFire = new CreateSnapshotEvent(
            snapshotName.valueOf() as string,
        );
        PubSubManager.instance.fireEvent(eventToFire);
    }

    let {
        open = $bindable(),
        appDynamicColorTheme,
        ...restProps
    }: CreateSnapshotModalProps = $props();

    const colorVariant = AppDynamicColorThemeColorSelector.PRIMARY.toString();
    const dynamicColorTheme = $derived(
        tempgetDynamicColorTheme(appDynamicColorTheme),
    );
</script>

<SubmitCancelModal
    id="create_snapshot_modal"
    bind:open
    title="Create Snapshot"
    description="Please enter a name for the new snapshot."
    actionButtonText="Create"
    {colorVariant}
    {dynamicColorTheme}
    onsubmit={handleSubmit}
    {...restProps}
>
    <Label for="snapshot_name_input_id">Snapshot Name</Label>
    <Input
        id="snapshot_name_input_id"
        name="snapshot_name_input_name"
        placeholder="Snapshot Name"
        schema={zExtended.requiredString("Snapshot Name")}
        {colorVariant}
        {dynamicColorTheme}
    />
</SubmitCancelModal>
