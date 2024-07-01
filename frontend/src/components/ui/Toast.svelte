<svelte:options runes={true} />

<script context="module" lang="ts">
    export enum ToastType {
        SUCCESS = "success",
        WARNING = "warning",
        ERROR = "error" 
    }

    export interface ToastProps {
        class?:string;
        children: Snippet;
        type?:ToastType;
    }
</script>

<script lang="ts">
    import { Toast } from "flowbite-svelte";
    import type { Snippet } from "svelte";
    import { getColorClassesForFixedThemeColor, getFixedThemeColorByValue, themedTWMerge } from "../theme";

    let { type=ToastType.SUCCESS, class:styleClass, children, ...restProps }: ToastProps = $props();
    styleClass = themedTWMerge("m-2 rounded-component",
        getColorClassesForFixedThemeColor(getFixedThemeColorByValue(type)),
        styleClass 
    );

</script>

<Toast {...restProps} class={styleClass}>{@render children()}</Toast>
