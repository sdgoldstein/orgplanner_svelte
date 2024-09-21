<svelte:options runes={true} />

<script module  lang="ts">
    export interface LabelProps extends ParentComponentProps {
        for: string;
    }
</script>

<script lang="ts">
    import { Label } from "flowbite-svelte";
    import type { ParentComponentProps } from "../uicomponents";

    let { for: forProp, children, ...restProps }: LabelProps = $props();
</script>

<Label for={forProp} {...restProps}>{@render children()}</Label>
