<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import type { OrgPlanner } from "@src/model/orgPlanner";

    let currentOrg: OrgPlanner = $derived(page.data.orgPlanner);

    let orgId = $derived(currentOrg.id);
    let projectId = $derived(currentOrg.rootPlanningProject.id);
    let planId = $derived(currentOrg.rootPlanningProject.orgPlan.id);

    goto(`/org/${orgId}/project/${projectId}/plan/${planId}`);
</script>
