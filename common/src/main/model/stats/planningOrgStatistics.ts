import type {OrgStructure} from "../orgStructure/orgStructure";

import type {OrgStatistics} from "./orgStatistics";
import type {OrgSummaryStatistics} from "./orgSummaryStatistics";
import {PlanningManagerStatistics} from "./planningManagerStatistics";
import type {TeamStatistics} from "./teamStatistics";

/**
 * A version of org statistics that is associated with an org in planning state
 */
// FIXME - This should probably be an interface
class PlanningOrgStatistics
{
    private readonly _wrappedStatistics: OrgStatistics;
    private readonly _planningManagerStatistics: PlanningManagerStatistics;

    constructor(allStatistics: OrgStatistics)
    {
        this._wrappedStatistics = allStatistics;
        this._planningManagerStatistics = new PlanningManagerStatistics(this.wrappedStatistics.managerStatistics);
    }

    /**
     * Get the team statistics for the org in planning state
     */
    get teamStatistics(): TeamStatistics
    {
        return this.wrappedStatistics.teamStatistics;
    }

    /**
     * Get the organization summary statistics for the org in planning state
     */
    get orgSummaryStatistics(): OrgSummaryStatistics
    {
        return this.wrappedStatistics.orgSummaryStatistics;
    }

    /**
     * Get the manager related statistics for the org in planning state
     */
    get planningManagerStatistics(): PlanningManagerStatistics
    {
        return this._planningManagerStatistics;
    }

    /**
     * Retrieve the org statistics associate with the org state prior to planning
     *
     * @returns {OrgStatistics} the org statistics associate with the org state prior to planning
     * @private
     */
    private get wrappedStatistics(): OrgStatistics
    {
        return this._wrappedStatistics;
    }

    /**
     * Update the org statistics with the state in the provider planning org structure
     *
     * @param {PlanningOrgStructure} planningOrgStructure a planning org structure representing an org in planning state
     */
    update(planningOrgStructure: OrgStructure): void
    {
        this.planningManagerStatistics.update(planningOrgStructure);
    }
}

export {PlanningOrgStatistics};