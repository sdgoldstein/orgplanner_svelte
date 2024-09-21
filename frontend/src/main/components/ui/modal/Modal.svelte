<svelte:options runes={true} />

<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import type { OrgPlannerColorThemableComponentProps } from "../../theme";
    import type { Snippet } from "svelte";
    import type { ParentComponentProps } from "../uicomponents";

    interface ModalProps extends ParentComponentProps, OrgPlannerColorThemableComponentProps {
        open: boolean;
        title: string;
        autoclose?:boolean;
        header?:Snippet;
        footer?:Snippet;
    }
    let {
        open = $bindable(),
        title = "",
        autoclose=false,
        appDynamicColorTheme,
        header,
        children,
        footer,
        ...restProps
    }: ModalProps = $props();
</script>

<Modal
    {title}
    size="md"
    bind:open
    {autoclose}
    {...restProps}
    classHeader="p-0 pl-2"
    style="color:{appDynamicColorTheme.primary};"
>
    {@render children()} 
    <svelte:fragment slot="footer">
        {@render footer?.()}
    </svelte:fragment>
</Modal>
