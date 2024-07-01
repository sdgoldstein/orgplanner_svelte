<svelte:options runes={true} />

<script context="module" lang="ts">
    export type FormSubmissionHandler = (formData:FormData) => void;

    export type FormSubmitEvent = SubmitEvent & {
        currentTarget: EventTarget & HTMLFormElement;
    };

    export interface FormProps extends ParentComponentProps {
        onsubmit:FormSubmissionHandler;
    }
</script>

<script lang="ts">
    import type { ParentComponentProps } from "../uicomponents";
    import { enhance } from "$app/forms";
    import { writable } from "svelte/store";
    import { setContext } from 'svelte';
    import { DefaultZodFormValidator, FORM_VALIDATOR_CONTEXT_KEY } from "./form";

    function validate(formData:FormData):boolean
    {
        let valueToReturn = $formValidator.validate(formData);

        // FIXME - for reactivity for input components to update their forms based on error states
        $formValidator = $formValidator;

        return valueToReturn;
    }

    let formValidator = writable(new DefaultZodFormValidator());
    setContext(FORM_VALIDATOR_CONTEXT_KEY, formValidator);

    let {
        id,
        children:children,
        onsubmit:providedSubmitHandler,
        ...restProps
    }: FormProps = $props();
</script>


<form {id} method="POST" {...restProps} use:enhance={({ formElement, formData, action, cancel, submitter }) => {
    let isValid = validate(formData);
    if (isValid)
    {
        providedSubmitHandler(formData);
    }

    cancel();
}}>
    {@render children()}
</form>

