<script lang="ts">
    import {
        Breadcrumbs,
        BreadcrumbsDropdown,
        BreadcrumbsDropdownRouteItem,
        BreadcrumbsRouteItem,
    } from "@sphyrna/uicomponents";
    import type { OrgPlannerColorThemableComponentProps } from "@src/components/theme";

    interface PageHeaderProps extends OrgPlannerColorThemableComponentProps {}

    let { appDynamicColorTheme, ...restProps }: PageHeaderProps = $props();
</script>

<Breadcrumbs>
    <BreadcrumbsRouteItem route="/">Your Organization</BreadcrumbsRouteItem>
    <BreadcrumbsDropdown route="/">
        <BreadcrumbsDropdownRouteItem route="/"
            >Planning</BreadcrumbsDropdownRouteItem
        >
    </BreadcrumbsDropdown>
</Breadcrumbs>
