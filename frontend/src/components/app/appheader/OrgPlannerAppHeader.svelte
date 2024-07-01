<svelte:options runes={true} />

<script lang="ts">
  import { Navbar } from "flowbite-svelte";

  import OrgPlannerAppHeaderLogo from "./OrgPlannerAppHeaderLogo.svelte";
  import OrgPlannerMainNav from "./OrgPlannerMainNav.svelte";
  import NavContainer from "flowbite-svelte/NavContainer.svelte";
  import type { OrgPlannerColorThemableComponentProps } from "@src/components/theme";

  interface OrgPlannerAppHeaderProps
    extends OrgPlannerColorThemableComponentProps {}

  let { appDynamicColorTheme, ...restProps }: OrgPlannerAppHeaderProps =
    $props();
</script>

<header>
  <Navbar
    fluid={false}
    class="px-4 lg:px-6 py-2.5 border-b-2"
    style="background-color:{appDynamicColorTheme.primary}; color:{appDynamicColorTheme.textOnPrimary};"
  >
    <NavContainer class="flex flex-wrap justify-start items-center">
      <OrgPlannerAppHeaderLogo {appDynamicColorTheme} {...restProps} />
      <OrgPlannerMainNav {appDynamicColorTheme} {...restProps} />
    </NavContainer>
  </Navbar>
</header>
