<svelte:options runes={true} />

<script lang="ts">
  import { Navbar } from "flowbite-svelte";

  import OrgPlannerAppHeaderLogo from "./OrgPlannerAppHeaderLogo.svelte";
  import OrgPlannerMainNav from "./OrgPlannerMainNav.svelte";
</script>

<header>
  <Navbar fluid={false} class="px-4 lg:px-6 py-2.5 border-b-2">
    <OrgPlannerAppHeaderLogo />
    <OrgPlannerMainNav />
  </Navbar>
</header>
