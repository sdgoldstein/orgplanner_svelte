<script lang="ts">
    import {
        Breadcrumbs,
        BreadcrumbsItem,
        BreadcrumbsDropdown,
        BreadcrumbsDropdownItem,
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
    <BreadcrumbsItem>Your Organization</BreadcrumbsItem>
    <BreadcrumbsDropdown>
        <BreadcrumbsDropdownItem>Planning</BreadcrumbsDropdownItem>
    </BreadcrumbsDropdown>
</Breadcrumbs>
