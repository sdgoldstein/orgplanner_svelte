<svelte:options runes={true} />

<script context="module" lang="ts">
    export interface RadioProps extends ParentComponentProps {
        value: string | number;
        group: string;
        error?: string;
        checked?: boolean;
    }
</script>

<script lang="ts">
    import clsx from "clsx";

    import { Helper, Radio } from "flowbite-svelte";
    import type { ParentComponentProps } from "./uicomponents";

    let {
        value,
        group,
        checked = false,
        error,
        children,
        ...restProps
    }: RadioProps = $props();
</script>

<Radio
    {value}
    checked
    {group}
    {...restProps}
    class={clsx(error && "bg-error-200 border-error-500 text-error-500")}
    on:input={() => {
        error = undefined;
    }}>{@render children()}</Radio>
{#if error}
    <Helper class="text-error-500">{error}</Helper>
{/if}
