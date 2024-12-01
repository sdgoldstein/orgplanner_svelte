

import {
    SerializationFormat,
    type Serializable,
    type SerializableDescriptor,
    type SerializationHelper,
    type Serializer
} from "@src/jscore/serialization/serializationService";
import type {OrgStructure} from "./orgStructure/orgStructure";
import {BaseJSONSerializer} from "@src/jscore/serialization/jsonSerializer";

interface OrgPlan
{
    orgDataCore: OrgDataCore;
}

interface OrgSnapshot
{
    orgDataCore: OrgDataCore;
}

// Should this be a Mixin rather than an interface?
interface OrgDataCore extends Serializable
{
    title: string;
    orgStructure: OrgStructure;
    clone(): OrgDataCore;
}

class OrgDataCoreDefaultImpl implements OrgDataCore
{
    static readonly SERIALIZATION_DESCRIPTOR:
        SerializableDescriptor<OrgDataCoreDefaultImpl> = {name : "OrgDataCoreDefaultImpl", objectVersion: 1};

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

class OrgDataCoreDefaultImplSerializer extends BaseJSONSerializer<OrgDataCoreDefaultImpl> implements
    Serializer<OrgDataCoreDefaultImpl, SerializationFormat.JSON>
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

    deserialize(data: string): OrgDataCoreDefaultImpl
    {
        throw new Error("Method not implemented.");
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
