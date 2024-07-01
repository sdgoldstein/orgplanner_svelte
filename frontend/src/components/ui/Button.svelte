<svelte:options runes={true} />

<script context="module" lang="ts">

    interface ButtonProps extends OrgPlannerColorThemableComponentProps {
        disabled?: boolean;
        class?:string;
        children: Snippet;
        onclick?: (event:MouseEvent)=>void;
    }    
</script>
<script lang="ts">
 
    import { Button } from "flowbite-svelte";
    import type { Snippet } from "svelte";
    import { getDefaultStyle, themedTWMerge, type OrgPlannerColorThemableComponentProps } from "../theme";

    let { class:styleClass, appDynamicColorTheme, colorSelector, disabled = false,  onclick = ()=>{}, children, ...restProps }: ButtonProps = $props();
    styleClass = themedTWMerge("m-2 rounded-component",
        styleClass 
    );
</script>

<Button {disabled} class={styleClass} style={getDefaultStyle(appDynamicColorTheme, colorSelector)} on:click={onclick} {...restProps}>{@render children()}</Button>
