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
        FileInput,
        Label,
        zExtended,
    } from "@sphyrna/uicomponents";
    import { PubSubManager } from "orgplanner-common/jscore";
    import { ImportPlanEvent } from "@src/components/app/orgPlannerAppEvents";

    function checkFileType(file: File) {
        let valueToReturn = false;
        if (file?.name) {
            const fileType = file.name.split(".").pop();
            valueToReturn = fileType === "json";
        }
        return valueToReturn;
    }

    function handleSubmit(formData: FormData): void {
        const orgPlannerFile: FormDataEntryValue | null = formData.get(
            "import_org_file_input_name",
        );
        if (!orgPlannerFile) {
            throw Error("orgPlannerFile not found in form data");
        }

        const importFileReader = new FileReader();
        importFileReader.onload = (
            readerEvent: ProgressEvent<FileReader>,
        ): void => {
            const importedJSON = readerEvent?.target?.result;
            if (importedJSON) {
                open = false;

                // can convert to string given use of "readAsText" method below.  See FileReader.result
                const eventToFire = new ImportPlanEvent(importedJSON as string);
                PubSubManager.instance.fireEvent(eventToFire);
            }
        };
        importFileReader.readAsText(orgPlannerFile as File);
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
    description="Please select the organization plan export file."
    actionButtonText="Import"
    {colorVariant}
    {dynamicColorTheme}
    enctype="multipart/form-data"
    onsubmit={handleSubmit}
    {...restProps}
>
    <Label for="import_org_file_input_id">Organization Export File</Label>
    <FileInput
        id="import_org_file_input_id"
        name="import_org_file_input_name"
        placeholder=""
        schema={zExtended
            .any()
            .refine((file: File) => file?.size !== 0, "File is required")
            .refine(
                (file: File) => checkFileType(file),
                "Only json format are supported.",
            )}
        {colorVariant}
        {dynamicColorTheme}
    />
</SubmitCancelModal>
