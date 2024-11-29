import {type OrgPlan, OrgPlanDefaultImpl, type OrgSnapshot} from "./orgData";

interface PlanningProject
{
    title: string;
    orgPlan: OrgPlan;
}
/**
 * PlanningProject is the root of all planning state when planning an organization
 */
class PlanningProjectDefaultImpl implements PlanningProject
{
    title: string;
    orgPlan: OrgPlan;

    constructor(title: string, orgSnapShot: OrgSnapshot);
    constructor(title: string, orgPlan: OrgPlan);
    constructor(title: string, orgPlan?: OrgPlan, orgSnapShot?: OrgSnapshot)
    {
        this.title = title;

        if (orgPlan)
        {
            this.orgPlan = orgPlan;
        }
        else if (orgSnapShot)
        {
            const orgDataCoreClone = orgSnapShot.orgDataCore.clone();
            this.orgPlan = new OrgPlanDefaultImpl(orgDataCoreClone);
        }
        else
        {
            throw new Error("One of orgPlan or orgSnapShot must be provided")
        }
    }
}

export {PlanningProjectDefaultImpl};
export type{PlanningProject};
