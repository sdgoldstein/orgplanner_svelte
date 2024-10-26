<svelte:options runes={true} />

<script lang="ts">
  import {
    NavBar,
    NavBarBrand,
    NavBarBrandLogo,
    NavBarBrandTitle,
  } from "@sphyrna/uicomponents";
  import OrgPlannerAppHeaderLogo from "./OrgPlannerAppHeaderLogo.svelte";
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
  const dynamicColorTheme = tempgetDynamicColorTheme(appDynamicColorTheme);
</script>

<header>
  <NavBar {colorVariant} {dynamicColorTheme}>
    <NavBarBrand {colorVariant} {dynamicColorTheme}>
      <NavBarBrandLogo
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
