<script lang="ts">
    import NewOrgModal from "@src/components/orgchart/modal/NewOrgModal.svelte";
    import type { OrgPlannerColorThemableComponentProps } from "@src/components/theme";
    import { NavUl, NavLi } from "flowbite-svelte";

    interface OrgPlannerMainNavProps
        extends OrgPlannerColorThemableComponentProps {}

    let { appDynamicColorTheme, ...restProps }: OrgPlannerMainNavProps =
        $props();
    let open = $state(false);
</script>

<NavUl
    divClass="flex justify-center items-center grow"
    ulClass="flex font-medium space-x-8 border-0 bg-opacity-0"
    style="background-color:{appDynamicColorTheme.primary}; color:{appDynamicColorTheme.textOnPrimary};"
    {...restProps}
    hidden={false}
>
    <NavLi
        data-testid="new_org_main_nav_item_testid"
        onclick={() => {
            open = true;
        }}
        style="background-color:{appDynamicColorTheme.primary}; color:{appDynamicColorTheme.textOnPrimary};"
        >New</NavLi
    >
    <NavLi
        href="/"
        style="background-color:{appDynamicColorTheme.primary}; color:{appDynamicColorTheme.textOnPrimary};"
        >Import</NavLi
    >
    <NavLi
        href="/"
        style="background-color:{appDynamicColorTheme.primary}; color:{appDynamicColorTheme.textOnPrimary};"
        >Export</NavLi
    >
    <NavLi
        href="/"
        style="background-color:{appDynamicColorTheme.primary}; color:{appDynamicColorTheme.textOnPrimary};"
        >Org Design Theory</NavLi
    >
    <NavLi
        href="/"
        style="background-color:{appDynamicColorTheme.primary}; color:{appDynamicColorTheme.textOnPrimary};"
        >Help</NavLi
    >
</NavUl>

<NewOrgModal {appDynamicColorTheme} bind:open />
