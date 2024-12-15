import type {OrgStructure} from "./orgStructure/orgStructure";
import {
    BaseJSONSerializer,
    RegisterSerializer,
    RegisterSerializable,
    SerializationFormat,
    type SerializationHelper,
    type Serializer,
    JSONSerializationHelper
} from "orgplanner-common/jscore";

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

@RegisterSerializable("OrgDataCore", 1)
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

@RegisterSerializer("OrgDataCore", SerializationFormat.JSON)
class OrgDataCoreDefaultImplSerializer extends BaseJSONSerializer<OrgDataCore> implements
    Serializer<OrgDataCore, SerializationFormat.JSON>
{
    static readonly KEY: string = "organization";

    getKey(): string
    {
        return OrgDataCoreDefaultImplSerializer.KEY;
    }

    getValue(serializableObject: OrgDataCoreDefaultImpl,
             serializationHelper: SerializationHelper<SerializationFormat.JSON>): Record<string, string>
    {
        const valueToReturn: Record<string, string> = {};

        valueToReturn["title"] = serializableObject.title;
        valueToReturn["orgStructure"] = serializationHelper.serialize(serializableObject.orgStructure);

        return valueToReturn;
    }

    deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): OrgDataCore
    {
        const title: string = dataObject.title;
        const orgStructure: OrgStructure = serializationHelper.deserializeObject(dataObject.orgStructure);

        return new OrgDataCoreDefaultImpl(title, orgStructure);
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

export {OrgDataCoreDefaultImpl, OrgPlanDefaultImpl, OrgSnapshotDefaultImpl, OrgDataCoreDefaultImplSerializer};
export type{OrgDataCore, OrgPlan, OrgSnapshot};
