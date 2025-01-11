<script lang="ts">
  import {
    NavBar,
    NavBarBrand,
    NavBarBrandLogo,
    NavBarBrandTitle,
  } from "@sphyrna/uicomponents";
  import OrgPlannerMainNav from "./OrgPlannerMainNav.svelte";
  import {
    AppDynamicColorThemeColorSelector,
    tempgetDynamicColorTheme,
    type OrgPlannerColorThemableComponentProps,
  } from "@src/components/theme";

  interface OrgPlannerAppHeaderProps
    extends OrgPlannerColorThemableComponentProps {}

  let { appDynamicColorTheme, ...restProps }: OrgPlannerAppHeaderProps =
    $props();

  const colorVariant = AppDynamicColorThemeColorSelector.PRIMARY.toString();
  const dynamicColorTheme = $derived(
    tempgetDynamicColorTheme(appDynamicColorTheme),
  );
</script>

<header class="sticky top-0 left-0 right-0 z-50 w-full">
  <NavBar {colorVariant} {dynamicColorTheme}>
    <NavBarBrand {colorVariant} {dynamicColorTheme}>
      <NavBarBrandLogo
        id="org_planner_logo_id"
        testid="org_planner_logo_testid"
        {colorVariant}
        {dynamicColorTheme}
        src="organization-chart-icon.png"
        alt="Org Chart Icon"
      />
      <NavBarBrandTitle>Organization Architect</NavBarBrandTitle>
    </NavBarBrand>
    <OrgPlannerMainNav {appDynamicColorTheme} {...restProps} />
  </NavBar>
</header>
