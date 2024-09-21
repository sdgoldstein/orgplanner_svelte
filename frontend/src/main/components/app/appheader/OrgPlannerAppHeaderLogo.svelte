<svelte:options runes={true} />

<script lang="ts">
    import type { OrgPlannerColorThemableComponentProps } from "@src/components/theme";
    import Image from "@src/components/ui/Image.svelte";
    import { NavBrand } from "flowbite-svelte";

    interface OrgPlannerAppLogoProps
        extends OrgPlannerColorThemableComponentProps {}

    let { appDynamicColorTheme, ...restProps }: OrgPlannerAppLogoProps =
        $props();
</script>

<NavBrand href="/">
    <Image
        src="organization-chart-icon.png"
        alt="Org Chart Icon"
        className="mr-3 h-11 w-11"
    />
    <span
        class="self-center text-xl font-semibold whitespace-nowrap"
        style="background-color:{appDynamicColorTheme.primary}; color:{appDynamicColorTheme.textOnPrimary};"
        >Organization Architect</span
    >
</NavBrand>
