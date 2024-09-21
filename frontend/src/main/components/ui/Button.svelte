<svelte:options runes={true} />

<script module lang="ts">
	import { Button } from '@sphyrna/uicomponents'

    interface ButtonProps extends OrgPlannerColorThemableComponentProps {
        disabled?: boolean;
        class?:string;
        children: Snippet;
        onclick?: (event:MouseEvent)=>void;
    }    
</script>
<script lang="ts">
 
    import type { Snippet } from "svelte";
    import { getDefaultStyle, tempgetDynamicColorTheme, themedTWMerge, type OrgPlannerColorThemableComponentProps } from "../theme";

    let { class:styleClass, appDynamicColorTheme, colorSelector, disabled = false,  onclick = ()=>{}, children, ...restProps }: ButtonProps = $props();
    styleClass = themedTWMerge("m-2 rounded-component",
        styleClass 
    );
</script>

<!-- <Button {disabled} class={styleClass} style={getDefaultStyle(appDynamicColorTheme, colorSelector)} on:click={onclick} {...restProps}>{@render children()}</Button> -->
<Button colorVariant={colorSelector?.toString()} dynamicColorTheme={tempgetDynamicColorTheme(appDynamicColorTheme)} on:click={onclick} {...restProps}>{@render children()}</Button>