<svelte:options runes={true} />

<script module  lang="ts">
    import type { Snippet } from "svelte";

    export type FormSubmitEvent = SubmitEvent & {
        currentTarget: EventTarget & HTMLFormElement;
    };

    export interface SubmitCancelModalProps
        extends ParentComponentProps,
            OrgPlannerColorThemableComponentProps {
        open: boolean;
        title: string;
        onsubmit:FormSubmissionHandler;
        header?: Snippet;
    }
</script>

<script lang="ts">
    import Modal from "./Modal.svelte";
    import type { OrgPlannerColorThemableComponentProps } from "@src/components/theme";
    import type { ParentComponentProps } from "../uicomponents";
    import SubmitButton from "./SubmitButton.svelte";
    import CancelButton from "./CancelButton.svelte";    
    import Form, { type FormSubmissionHandler } from "../forms/Form.svelte";

    function close()
    {
        open = false;
    }

    let {
        open = $bindable(),
        title = "",
        appDynamicColorTheme,
        header,
        children:providedChildren,
        onsubmit:providedSubmitHandler,
        ...restProps
    }: SubmitCancelModalProps = $props();
</script>

<Modal
    {title}
    bind:open
    {appDynamicColorTheme}
    {...restProps}>
    {#snippet children()}
        <Form id="submit_cancel_form" onsubmit={providedSubmitHandler}>
        {@render providedChildren()}
        </Form>
    {/snippet} 
    {#snippet footer()}
        <SubmitButton {appDynamicColorTheme} form="submit_cancel_form" type="submit"/>
        <CancelButton {appDynamicColorTheme} oncancel={close}/>
    {/snippet}  
</Modal>
