<script lang="ts">
    import { ServiceManager } from "@sphyrna/service-manager-ts";
    import {
        OrgPlannerAppEvents,
        CreateNewOrgEvent,
    } from "@src/components/app/orgPlannerAppEvents";
    import "@src/app/app.css";

    import OrgPlannerAppHeader from "@src/components/app/appheader/OrgPlannerAppHeader.svelte";
    import PageHeader from "@src/components/page/header/PageHeader.svelte";
    import { getAppDynamicColorTheme } from "@src/components/theme";
    import type { OrgPlannerManager } from "@src/model/orgPlanner";
    import { OrgPlannerAppServicesConstants } from "@src/services/orgPlannerAppServicesConstants";
    import { PubSubManager } from "orgplanner-common/jscore";
    import type { PubSubEvent } from "orgplanner-common/jscore";

    export let data;

    let appDynamicColorTheme = getAppDynamicColorTheme(
        data.orgPlanner.settings.colorTheme,
    );

    // Is this the best place for this?  Not sure.  And, does it work?  Not Sure
    const pubSubManager = PubSubManager.instance;
    pubSubManager.registerListener(OrgPlannerAppEvents.CREATE_NEW_ORG, {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            const createOrgEvent = eventToHandle as CreateNewOrgEvent;
            const orgName = createOrgEvent.orgName;

            const orgPlannerManager =
                ServiceManager.getService<OrgPlannerManager>(
                    OrgPlannerAppServicesConstants.ORG_PLANNER_MANAGER_SERVICE,
                ) as OrgPlannerManager;

            const orgPlanner =
                orgPlannerManager.createOrgPlannerWithTitle(orgName);

            data.orgPlanner = orgPlanner;
        },
    });
</script>

<OrgPlannerAppHeader {appDynamicColorTheme}></OrgPlannerAppHeader>
<PageHeader></PageHeader>

<slot></slot>
