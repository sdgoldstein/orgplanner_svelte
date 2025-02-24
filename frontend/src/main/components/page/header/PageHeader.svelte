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

    let { appDynamicColorTheme, ...restProps }: PageHeaderProps = $props();

    const colorVariant = AppDynamicColorThemeColorSelector.PRIMARY.toString();
    const dynamicColorTheme = $derived(
        tempgetDynamicColorTheme(appDynamicColorTheme),
    );
</script>

<Breadcrumbs>
    <BreadcrumbsRouteItem>Your Organization</BreadcrumbsRouteItem>
    <BreadcrumbsDropdown>
        <BreadcrumbsDropdownRouteItem>Planning</BreadcrumbsDropdownRouteItem>
    </BreadcrumbsDropdown>
</Breadcrumbs>
