<script lang="ts">
    import { NavMenu, NavMenuItem } from "@sphyrna/uicomponents";
    import ImportOrgModal from "@src/components/orgchart/modal/ImportOrgModal.svelte";
    import NewEditOrgModal from "@src/components/orgchart/modal/NewEditOrgModal.svelte";
    import {
        AppDynamicColorThemeColorSelector,
        tempgetDynamicColorTheme,
        type OrgPlannerColorThemableComponentProps,
    } from "@src/components/theme";
    import { ExportPlanEvent } from "../orgPlannerAppEvents";
    import { PubSubManager } from "orgplanner-common/jscore";

    interface OrgPlannerMainNavProps
        extends OrgPlannerColorThemableComponentProps {}

    let { appDynamicColorTheme, ...restProps }: OrgPlannerMainNavProps =
        $props();
    let newEditOrgModalOpen = $state(false);
    let importOrgModalOpen = $state(false);

    const colorVariant = AppDynamicColorThemeColorSelector.PRIMARY.toString();
    const dynamicColorTheme = $derived(
        tempgetDynamicColorTheme(appDynamicColorTheme),
    );
</script>

<NavMenu {colorVariant} {dynamicColorTheme}>
    <NavMenuItem
        testid="new_org_main_nav_item_testid"
        {colorVariant}
        {dynamicColorTheme}
        onclick={() => {
            newEditOrgModalOpen = true;
        }}>New</NavMenuItem
    >
    <NavMenuItem href="/" {colorVariant} {dynamicColorTheme}>Import</NavMenuItem
    >
    <NavMenuItem
        testid="export_org_main_nav_item_testid"
        {colorVariant}
        {dynamicColorTheme}
        onclick={() => {
            const eventToFire = new ExportPlanEvent();
            PubSubManager.instance.fireEvent(eventToFire);
        }}>Export</NavMenuItem
    >
    <NavMenuItem href="/" {colorVariant} {dynamicColorTheme}
        >Org Design Theory</NavMenuItem
    >
    <NavMenuItem href="/" {colorVariant} {dynamicColorTheme}>Help</NavMenuItem>
</NavMenu>
<NewEditOrgModal {appDynamicColorTheme} bind:open={newEditOrgModalOpen} />
<ImportOrgModal {appDynamicColorTheme} bind:open={importOrgModalOpen} />
