<script module lang="ts">
    import {
        AppDynamicColorThemeColorSelector,
        tempgetDynamicColorTheme,
        type OrgPlannerColorThemableComponentProps,
    } from "@src/components/theme";

    interface NewEditOrgModalProps
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
    import { CreateNewOrgEvent } from "@src/components/app/orgPlannerAppEvents";
    import { PubSubManager } from "orgplanner-common/jscore";

    function handleSubmit(formData: FormData): void {
        const orgName: FormDataEntryValue | null = formData.get(
            "new_org_title_input_name",
        );
        if (!orgName) {
            throw Error("orgName not found in form data");
        }

        open = false;
        const eventToFire = new CreateNewOrgEvent(orgName.valueOf() as string);
        PubSubManager.instance.fireEvent(eventToFire);
    }

    let {
        open = $bindable(),
        appDynamicColorTheme,
        ...restProps
    }: NewEditOrgModalProps = $props();

    const colorVariant = AppDynamicColorThemeColorSelector.PRIMARY.toString();
    const dynamicColorTheme = $derived(
        tempgetDynamicColorTheme(appDynamicColorTheme),
    );
</script>

<SubmitCancelModal
    id="new_org_modal"
    bind:open
    title="New Organization"
    description="Please enter a title for the new organization."
    actionButtonText="Create"
    {colorVariant}
    {dynamicColorTheme}
    onsubmit={handleSubmit}
    {...restProps}
>
    <Label for="new_org_title_input_id">Title</Label>
    <Input
        id="new_org_title_input_id"
        name="new_org_title_input_name"
        placeholder="New Org"
        schema={zExtended.requiredString("Organization")}
        {colorVariant}
        {dynamicColorTheme}
    />
</SubmitCancelModal>
