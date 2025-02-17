<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import type { OrgPlanner } from "@src/model/orgPlanner";

    let currentOrg: OrgPlanner = page.data.orgPlanner;

    let orgId = currentOrg.id;
    let projectId = currentOrg.rootPlanningProject.id;
    let planId = currentOrg.rootPlanningProject.orgPlan.id;

    goto(`/org/${orgId}/project/${projectId}/plan/${planId}`);
</script>
