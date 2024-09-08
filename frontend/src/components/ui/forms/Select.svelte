<svelte:options runes={true} />

<script module  lang="ts">
    export interface SelectProps extends ParentComponentProps {
        value?: any;
        error?: string;
        name?:string;
        onchange?:(e: Event) => void
    }
</script>

<script lang="ts">
    import clsx from "clsx";

    import { Helper, Select } from "flowbite-svelte";
    import type { ParentComponentProps } from "../uicomponents";

    let {
        id,
        value = $bindable(),
        name,
        error,
        onchange=()=>{},
        children,
        ...restProps
    }: SelectProps = $props();
</script>

<Select {name} size="sm" class={clsx(error && "bg-error-200 border-error-500 text-error-500")} {...restProps}
    on:input={() => {
        error = undefined;
    }}
    on:change={onchange}
>{@render children()}</Select>
{#if error}
    <Helper class="text-error-500">{error}</Helper>
{/if}
