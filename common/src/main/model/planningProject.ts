import {
    BaseJSONSerializer,
    JSONSerializationHelper,
    RegisterSerializable,
    RegisterSerializer,
    SerializationFormat,
    type Serializer
} from "orgplanner-common/jscore";
import {type OrgPlan, OrgPlanDefaultImpl, type OrgSnapshot} from "./orgData";

interface PlanningProject
{
    title: string;
    readonly orgPlan: OrgPlan;

    // WHat happens when I create a snapshot of plan?  Is it part of the planning project  Do we need a set of snapshot
    // here?
}
/**
 * PlanningProject is the root of all planning state when planning an organization
 */
@RegisterSerializable("PlanningProject", 1)
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

@RegisterSerializer("PlanningProject", SerializationFormat.JSON)
class PlanningProjectDefaultImplSerializer extends BaseJSONSerializer<PlanningProject> implements
    Serializer<PlanningProject, SerializationFormat.JSON>
{
    deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): PlanningProject
    {
        const orgPlan = serializationHelper.deserializeObject<OrgPlan>(dataObject.orgPlan);
        return new PlanningProjectDefaultImpl(dataObject.title, orgPlan);
    }
}

export {PlanningProjectDefaultImpl, PlanningProjectDefaultImplSerializer};
export type{PlanningProject};
