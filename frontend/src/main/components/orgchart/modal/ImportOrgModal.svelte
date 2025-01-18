<script module lang="ts">
    import {
        AppDynamicColorThemeColorSelector,
        tempgetDynamicColorTheme,
        type OrgPlannerColorThemableComponentProps,
    } from "@src/components/theme";

    interface ImportOrgModalProps
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

    function handleSubmit(formData: FormData): void {
        const orgName: FormDataEntryValue | null = formData.get(
            "import_org_title_input_name",
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
    }: ImportOrgModalProps = $props();

    const colorVariant = AppDynamicColorThemeColorSelector.PRIMARY.toString();
    const dynamicColorTheme = $derived(
        tempgetDynamicColorTheme(appDynamicColorTheme),
    );
</script>

<SubmitCancelModal
    id="import_org_modal"
    bind:open
    title="Import Organization"
    description="Please enter a title for the new organization."
    actionButtonText="Create"
    {colorVariant}
    {dynamicColorTheme}
    onsubmit={handleSubmit}
    {...restProps}
>
    <Label for="import_org_title_input_id">Title</Label>
    <Input
        id="import_org_title_input_id"
        name="import_org_title_input_name"
        placeholder="New Org"
        schema={zExtended.requiredString("Organization")}
        {colorVariant}
        {dynamicColorTheme}
    />
</SubmitCancelModal>
