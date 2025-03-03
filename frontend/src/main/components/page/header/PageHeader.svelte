<script lang="ts">
    import {
        Breadcrumbs,
        BreadcrumbsDropdown,
        BreadcrumbsDropdownRouteItem,
        BreadcrumbsRouteItem,
    } from "@sphyrna/uicomponents";
    import {
        AppDynamicColorThemeColorSelector,
        tempgetDynamicColorTheme,
        type OrgPlannerColorThemableComponentProps,
    } from "@src/components/theme";

    interface PageHeaderProps extends OrgPlannerColorThemableComponentProps {}

    let { appDynamicColorTheme }: PageHeaderProps = $props();

    const dynamicColorTheme = $derived(
        tempgetDynamicColorTheme(appDynamicColorTheme),
    );
    const colorVariant = AppDynamicColorThemeColorSelector.SECONDARY.toString();
</script>

<div class="sticky top-0">
    <Breadcrumbs {colorVariant} {dynamicColorTheme}>
        <BreadcrumbsRouteItem route="/">Your Organization</BreadcrumbsRouteItem>
        <BreadcrumbsDropdown route="/">
            <BreadcrumbsDropdownRouteItem route="/"
                >Planning</BreadcrumbsDropdownRouteItem
            >
        </BreadcrumbsDropdown>
    </Breadcrumbs>
</div>
