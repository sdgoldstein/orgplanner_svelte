import type {OrgStructure} from "./orgStructure/orgStructure";
import {
    BaseJSONSerializer,
    RegisterSerializer,
    RegisterSerializable,
    SerializationFormat,
    type Serializer,
    JSONSerializationHelper
} from "orgplanner-common/jscore";
import {v4 as uuidv4} from "uuid";

interface OrgPlan
{
    readonly id: string;
    title: string;
    orgDataCore: OrgDataCore;
}

interface OrgSnapshot
{
    readonly id: string;
    title: string;
    orgDataCore: OrgDataCore;
}

// Should this be a Mixin rather than an interface?
interface OrgDataCore
{
    orgStructure: OrgStructure;
    clone(): OrgDataCore;
}

@RegisterSerializable("OrgDataCore", 1)
class OrgDataCoreDefaultImpl implements OrgDataCore
{
    orgStructure: OrgStructure;

    constructor(orgStructure: OrgStructure)
    {
        this.orgStructure = orgStructure;
    }

    clone(): OrgDataCore
    {
        return new OrgDataCoreDefaultImpl(this.orgStructure.deepClone());
    }
}

@RegisterSerializer("OrgDataCore", SerializationFormat.JSON)
class OrgDataCoreDefaultImplSerializer extends BaseJSONSerializer<OrgDataCore> implements
    Serializer<OrgDataCore, SerializationFormat.JSON>
{
    static readonly KEY: string = "organization";

    getKey(): string
    {
        return OrgDataCoreDefaultImplSerializer.KEY;
    }

    deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): OrgDataCore
    {
        const orgStructure: OrgStructure = serializationHelper.deserializeObject(dataObject.orgStructure);

        return new OrgDataCoreDefaultImpl(orgStructure);
    }
}

@RegisterSerializable("OrgPlan", 1)
class OrgPlanDefaultImpl implements OrgPlan
{
    readonly id: string;

    constructor(title: string, orgDataCore: OrgDataCore);
    constructor(title: string, orgDataCore: OrgDataCore, id: string);
    constructor(public title: string, public orgDataCore: OrgDataCore, id?: string)
    {
        this.id = id ?? uuidv4();
    }
}

@RegisterSerializer("OrgPlan", SerializationFormat.JSON)
class OrgPlanDefaultImplSerializer extends BaseJSONSerializer<OrgPlan> implements
    Serializer<OrgPlan, SerializationFormat.JSON>
{
    deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): OrgPlan
    {
        const orgDataCore = serializationHelper.deserializeObject<OrgDataCore>(dataObject.orgDataCore);
        return new OrgPlanDefaultImpl(dataObject.title, orgDataCore, dataObject.id);
    }
}

@RegisterSerializable("OrgSnapshot", 1)
class OrgSnapshotDefaultImpl implements OrgSnapshot
{
    readonly id: string;

    constructor(title: string, orgDataCore: OrgDataCore);
    constructor(title: string, orgDataCore: OrgDataCore, id: string);
    constructor(public title: string, public orgDataCore: OrgDataCore, id?: string)
    {
        this.id = id ?? uuidv4();
    }
}

@RegisterSerializer("OrgSnapshot", SerializationFormat.JSON)
class OrgSnapshotDefaultImplSerializer extends BaseJSONSerializer<OrgSnapshot> implements
    Serializer<OrgSnapshot, SerializationFormat.JSON>
{
    deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): OrgPlan
    {
        const orgDataCore = serializationHelper.deserializeObject<OrgDataCore>(dataObject.orgDataCore);
        return new OrgSnapshotDefaultImpl(dataObject.title, orgDataCore, dataObject.id);
    }
}

export {
    OrgDataCoreDefaultImpl,
    OrgPlanDefaultImpl,
    OrgSnapshotDefaultImpl,
    OrgDataCoreDefaultImplSerializer,
    OrgSnapshotDefaultImplSerializer,
    OrgPlanDefaultImplSerializer
};
export type{OrgDataCore, OrgPlan, OrgSnapshot};
