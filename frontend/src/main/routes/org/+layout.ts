import {ServiceManager} from "@sphyrna/service-manager-ts";
import type {OrgPlanner, OrgPlannerManager} from "@src/model/orgPlanner";
import {OrgPlannerAppServicesConstants} from "@src/services/orgPlannerAppServicesConstants";

import type {LayoutLoad} from "../$types";

export const ssr = false;

export const load: LayoutLoad = ({url}) => {
    /* Load the OrgPlanner for the page */
    const bypassLocalStorageParam = url.searchParams.get("bypassLocalStorage") ?? undefined;

    const orgPlannerManager = ServiceManager.getService<OrgPlannerManager>(
                                  OrgPlannerAppServicesConstants.ORG_PLANNER_MANAGER_SERVICE) as OrgPlannerManager;
    const orgPlanner: OrgPlanner = orgPlannerManager.createOrgPlannerSync(bypassLocalStorageParam);

    return {orgPlanner : orgPlanner};
};