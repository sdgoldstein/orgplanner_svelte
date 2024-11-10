<script lang="ts">
    import { NavMenu, NavMenuItem } from "@sphyrna/uicomponents";
    import NewOrgModal from "@src/components/orgchart/modal/NewOrgModal.svelte";
    import {
        AppDynamicColorThemeColorSelector,
        tempgetDynamicColorTheme,
        type OrgPlannerColorThemableComponentProps,
    } from "@src/components/theme";

    interface OrgPlannerMainNavProps
        extends OrgPlannerColorThemableComponentProps {}

    let { appDynamicColorTheme, ...restProps }: OrgPlannerMainNavProps =
        $props();
    let open = $state(false);

    const colorVariant = AppDynamicColorThemeColorSelector.PRIMARY.toString();
    const dynamicColorTheme = $derived(
        tempgetDynamicColorTheme(appDynamicColorTheme),
    );
</script>

<NavMenu {colorVariant} {dynamicColorTheme}>
    <NavMenuItem
        id="new_org_main_nav_item_testid"
        onclick={() => {
            open = true;
        }}
        {colorVariant}
        {dynamicColorTheme}>New</NavMenuItem
    >
    <NavMenuItem href="/" {colorVariant} {dynamicColorTheme}>Import</NavMenuItem
    >
    <NavMenuItem href="/" {colorVariant} {dynamicColorTheme}>Export</NavMenuItem
    >
    <NavMenuItem href="/" {colorVariant} {dynamicColorTheme}
        >Org Design Theory</NavMenuItem
    >
    <NavMenuItem href="/" {colorVariant} {dynamicColorTheme}>Help</NavMenuItem>
</NavMenu>
<NewOrgModal {appDynamicColorTheme} bind:open />
