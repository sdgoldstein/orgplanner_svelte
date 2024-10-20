

import {OrgStructure} from "./orgStructure/orgStructure";

interface OrgPlan
{
    orgDataCore: OrgDataCore;
}

interface OrgSnapshot
{
    orgDataCore: OrgDataCore;
}

// Should this be a Mixin rather than an interface?
interface OrgDataCore
{
    title: string;
    orgStructure: OrgStructure;
    clone(): OrgDataCore;
}

class OrgDataCoreDefaultImpl implements OrgDataCore
{
    title: string;
    orgStructure: OrgStructure;

    constructor(title: string, orgStructure: OrgStructure)
    {
        this.title = title;
        this.orgStructure = orgStructure;
    }
    clone(): OrgDataCore
    {
        return new OrgDataCoreDefaultImpl(this.title, this.orgStructure.deepClone());
    }
}

class OrgPlanDefaultImpl implements OrgPlan
{
    orgDataCore: OrgDataCore;

    constructor(orgDataCore: OrgDataCore)
    {
        this.orgDataCore = orgDataCore;
    }
}

class OrgSnapshotDefaultImpl implements OrgSnapshot
{
    orgDataCore: OrgDataCore;

    constructor(orgDataCore: OrgDataCore)
    {
        this.orgDataCore = orgDataCore;
    }
}

export {OrgDataCoreDefaultImpl, OrgPlanDefaultImpl, OrgSnapshotDefaultImpl};
export type{OrgDataCore, OrgPlan, OrgSnapshot};
