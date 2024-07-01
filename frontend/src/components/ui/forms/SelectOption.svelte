<svelte:options runes={true} />

<script context="module" lang="ts">
    import type { ParentComponentProps } from "../uicomponents";

    export interface SelectOptionProps extends ParentComponentProps {
        value: any;
        disabled?:boolean;
        selected?:boolean;
    }
</script>

<script lang="ts">
    let { value, disabled=false, selected=false, children, ...restProps }: SelectOptionProps = $props();
</script>

<option value={value} {disabled} {selected} {...restProps}>{@render children()}</option>
