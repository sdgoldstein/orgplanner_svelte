<script context="module" lang="ts">
    interface NewOrgeModalProps extends OrgPlannerColorThemableComponentProps {
        open: boolean;
        class?: string;
    }
</script>

<script lang="ts">
    import { CreateNewOrgEvent } from "@src/components/app/orgPlannerAppEvents";
    import type { OrgPlannerColorThemableComponentProps } from "@src/components/theme";
    import Input from "@src/components/ui/forms/Input.svelte";
    import Label from "@src/components/ui/forms/Label.svelte";
    import SubmitCancelModal from "@src/components/ui/modal/SubmitCancelModal.svelte";
    import { PubSubManager } from "orgplanner-common/jscore";
    import { zExtended } from "@src/components/ui/forms/form";

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

    let { open = $bindable(), ...restProps }: NewOrgeModalProps = $props();
</script>

<SubmitCancelModal
    bind:open
    title="New Organziation"
    onsubmit={handleSubmit}
    {...restProps}
>
    <Label for="new_org_title_input_id"
        >Please enter a title for the new organization:</Label
    >
    <Input
        id="new_org_title_input_id"
        name="new_org_title_input_name"
        placeholder="New Org"
        schema={zExtended.requiredString("Organization")}
    />
</SubmitCancelModal>
