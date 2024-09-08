<svelte:options runes={true} />

<script module  lang="ts">
    export interface InputProps extends BaseComponentProps {
        name: string;
        placeholder?: string;
        schema?: ZodType;
        error?: string;
        class?: string;
    }
</script>

<script lang="ts">
    import clsx from "clsx";

    import { Helper, Input } from "flowbite-svelte";
    import { getContext } from "svelte";
    import { type ZodType } from "zod";
    import {
        FORM_VALIDATOR_CONTEXT_KEY,
        type FormError,
        type ZodFormValidator,
    } from "./form";
    import type { Writable } from "svelte/store";
    import type { BaseComponentProps } from "../uicomponents";

    let {
        id,
        name,
        placeholder,
        schema,
        error,
        class: providedClass,
        ...restProps
    }: InputProps = $props();

    const formValidator: Writable<ZodFormValidator> = getContext(
        FORM_VALIDATOR_CONTEXT_KEY,
    );
    if (schema) {
        $formValidator.register(name, schema);
    }
    let errors: FormError[] = $derived($formValidator.getErrors(name));
</script>

<Input
    {id}
    {name}
    {placeholder}
    size="sm"
    class={clsx(
        errors.length > 0 && "bg-error-200 border-error-500 text-error-500",
        providedClass,
    )}
    {...restProps}
    on:input={() => {
        $formValidator.clearErrors(name);

        // FIXME - force update
        $formValidator = $formValidator;
    }}
/>
{#if errors.length > 0}
    <Helper class="text-error-500">{errors[0].getMessage()}</Helper>
{/if}
