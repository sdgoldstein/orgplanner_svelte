

import {OrgStructure} from "./orgStructure/orgStructure";
import {OrgStatistics} from "./stats/orgStatistics";
import {StatsCollector} from "./stats/statsCollector";

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
    orgStatistics: OrgStatistics;
    orgStructure: OrgStructure;
    clone(): OrgDataCore;
}

class OrgDataCoreDefaultImpl implements OrgDataCore
{
    title: string;
    orgStatistics: OrgStatistics;
    orgStructure: OrgStructure;

    constructor(title: string, orgStructure: OrgStructure)
    {
        this.title = title;
        this.orgStructure = orgStructure;
        this.orgStatistics = StatsCollector.instance.collectStats(this.orgStructure);
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
export type {OrgDataCore, OrgPlan, OrgSnapshot};
