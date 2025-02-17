import {
    BaseJSONSerializer,
    JSONSerializationHelper,
    RegisterSerializable,
    RegisterSerializer,
    SerializationFormat,
    type Serializer
} from "orgplanner-common/jscore";
import {OrgPlanDefaultImpl, OrgSnapshotDefaultImpl, type OrgDataCore, type OrgPlan, type OrgSnapshot} from "./orgData";
import {v4 as uuidv4} from "uuid";
import {BaseService, type Service} from "@sphyrna/service-manager-ts";

interface PlanningProject
{
    readonly id: string;

    /**
     * The title of the planning project
     */
    title: string;

    /**
     * The planning state of the org.
     *
     * Note: In the future, there could be multiple plans in progress at the same time that
     * are part of the planning project.  Today, there is only one.
     */
    readonly orgPlan: OrgPlan;

    /**
     * The org snapshots that have been created as part of this planning project
     */
    readonly orgSnapshots: OrgSnapshot[];

    /*
     *  Create a new snapshot of the planning org
     */
    createSnapshot(snapshotTitle: string): void;
}

/**
 * Planning Project Factory
 */
interface PlanningProjectFactoryService extends Service
{
    createFromOrgPlan(title: string, orgPlan: OrgPlan): PlanningProject;
    createFromOrgSnapshot(title: string, orgSnapshot: OrgSnapshot): PlanningProject;
    createFromOrgDataCore(title: string, orgData: OrgDataCore): PlanningProject;
}

class PlanningProjectFactorServiceDefaultImpl extends BaseService implements PlanningProjectFactoryService
{
    createFromOrgPlan(title: string, orgPlan: OrgPlan): PlanningProject
    {
        return new PlanningProjectDefaultImpl(title, orgPlan);
    }

    createFromOrgSnapshot(title: string, orgSnapshot: OrgSnapshot): PlanningProject
    {
        // Current, an org plan and org snapshot are the same contents
        return new PlanningProjectDefaultImpl(title, orgSnapshot as OrgPlan);
    }

    createFromOrgDataCore(title: string, orgData: OrgDataCore): PlanningProject
    {
        const orgPlan = new OrgPlanDefaultImpl(title, orgData);

        return new PlanningProjectDefaultImpl(title, orgPlan);
    }
}

/**
 * PlanningProject is the root of all planning state when planning an organization
 */
@RegisterSerializable("PlanningProject", 1)
class PlanningProjectDefaultImpl implements PlanningProject
{
    readonly id: string;

    constructor(title: string, orgPlan: OrgPlan);
    constructor(title: string, orgPlan: OrgPlan, id: string, orgSnapshots: OrgSnapshot[]);
    constructor(public title: string, public readonly orgPlan: OrgPlan, id?: string,
                public readonly orgSnapshots: OrgSnapshot[] = [])
    {
        this.id = id ?? uuidv4();
    }

    createSnapshot(snapshotTitle: string): void
    {
        const snapshotOrgDataCore = this.orgPlan.orgDataCore.clone();
        const snapshot = new OrgSnapshotDefaultImpl(snapshotTitle, snapshotOrgDataCore);
        this.orgSnapshots.push(snapshot);
    }
}

@RegisterSerializer("PlanningProject", SerializationFormat.JSON)
class PlanningProjectDefaultImplSerializer extends BaseJSONSerializer<PlanningProject> implements
    Serializer<PlanningProject, SerializationFormat.JSON>
{
    deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): PlanningProject
    {
        const orgPlan = serializationHelper.deserializeObject<OrgPlan>(dataObject.orgPlan);
        const orgSnapshots: OrgSnapshot[] =
            this.deserializeIterable<OrgSnapshot>(dataObject.orgSnapshots, serializationHelper);
        return new PlanningProjectDefaultImpl(dataObject.title, orgPlan, dataObject.id, orgSnapshots);
    }
}

export {PlanningProjectFactorServiceDefaultImpl};
export type{PlanningProject, PlanningProjectFactoryService, PlanningProjectDefaultImplSerializer};
