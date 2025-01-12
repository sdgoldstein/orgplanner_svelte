import {
    BaseJSONSerializer,
    RegisterSerializer,
    RegisterSerializable,
    SerializationFormat,
    type SerializationHelper,
    type Serializer,
    JSONSerializationHelper
} from "orgplanner-common/jscore";
import {OrgDataCoreDefaultImplSerializer} from "../orgData";

interface OrgEntityType
{
    name: string;
    label: string;
}

class OrgEntityTypes
{
    private static readonly NAME_TO_TYPE_MAP: Map<string, OrgEntityType> = new Map<string, OrgEntityType>();

    static readonly MANAGER: OrgEntityType = {
        name : "Manager",
        label: "Manager",
    };

    static readonly INDIVIDUAL_CONTRIBUTOR: OrgEntityType = {
        name : "Individual_Contributor",
        label: "Individual Contributor",
    };

    static readonly TEAM: OrgEntityType = {
        name : "Team",
        label: "Team",
    };

    static
    {
        OrgEntityTypes.NAME_TO_TYPE_MAP.set(this.MANAGER.name, this.MANAGER);
        OrgEntityTypes.NAME_TO_TYPE_MAP.set(this.INDIVIDUAL_CONTRIBUTOR.name, this.INDIVIDUAL_CONTRIBUTOR);
        OrgEntityTypes.NAME_TO_TYPE_MAP.set(this.TEAM.name, this.TEAM);
    }
    static getTypeByName(name: string): OrgEntityType
    {
        const valueToReturn = this.NAME_TO_TYPE_MAP.get(name);
        if (valueToReturn === undefined)
        {
            throw new Error(`Type by name not found, ${name}`);
        }

        return valueToReturn;
    }

    static typeIterator(): IterableIterator<OrgEntityType>
    {
        return this.NAME_TO_TYPE_MAP.values();
    }
}

interface OrgEntity
{
    readonly id: string;
    orgEntityType: OrgEntityType;
    canDelete(): boolean;
    canMove(): boolean;
}

interface OrgEntityPropertyCarrier
{
    getPropertyValue(propertyName: string): string;
    setPropertyValue(propertyName: string, value: string): void;
    propertyDescriptorIterator(): IterableIterator<OrgEntityPropertyDescriptor>;
}

type OrgEntityPropertyBag = Map<string, string>;
const EMPTY_PROPERTY_BAG: OrgEntityPropertyBag = new Map();

/**
 * This class can be used as a helper using composition.  (I
 * wasn't able to get mixins to work as I would have liked)
 */
class PropertyCarrierHelper implements OrgEntityPropertyCarrier
{
    private readonly _properties: Map<string, string> = new Map<string, string>();
    private readonly _propertyDescriptors: Map<string, OrgEntityPropertyDescriptor> =
        new Map<string, OrgEntityPropertyDescriptor>();

    constructor(propertyDescriptors: Set<OrgEntityPropertyDescriptor>, properties: OrgEntityPropertyBag)
    {
        for (const nextPropertyDescriptor of propertyDescriptors)
        {
            this._propertyDescriptors.set(nextPropertyDescriptor.name, nextPropertyDescriptor);
            this._properties.set(nextPropertyDescriptor.name, nextPropertyDescriptor.defaultValue);
        }

        for (const nextProperty of properties)
        {
            this.setPropertyValue(nextProperty[0], nextProperty[1]);
        }
    }

    getPropertyValue(propertyName: string): string
    {
        const propertyDescriptor = this._propertyDescriptors.get(propertyName);
        if (propertyDescriptor === undefined)
        {
            throw new Error("Property does not exist: " + propertyName);
        }

        const valueToReturn = this._properties.get(propertyName);
        if (valueToReturn === undefined)
        {
            throw new Error("Unepxecged condition:  Property value does not exist for property: " + propertyName);
        }

        return valueToReturn;
    }

    setPropertyValue(propertyName: string, value: string): void
    {
        const propertyDescriptor: OrgEntityPropertyDescriptor|undefined = this._propertyDescriptors.get(propertyName);
        if (propertyDescriptor === undefined)
        {
            throw new Error("Property does not exist: " + propertyName);
        }
        this._properties.set(propertyName, value);
    }

    propertyDescriptorIterator(): IterableIterator<OrgEntityPropertyDescriptor>
    {
        return this._propertyDescriptors.values();
    }
}

interface OrgEntityPropertyDescriptor
{
    name: string;
    title: string;
    defaultValue: string;
    defaultVisibility: boolean;
    defaultDisplayOrder: number;
    enabled: boolean;
    canDisable: boolean;
}

@RegisterSerializable("OrgEntityPropertyDescriptor", 1)
class OrgEntityPropertyDescriptorImpl implements OrgEntityPropertyDescriptor
{
    constructor(public name: string, public title: string, public defaultValue: string,
                public defaultVisibility: boolean, public defaultDisplayOrder: number, public enabled: boolean,
                public canDisable: boolean)
    {
    };
}

@RegisterSerializer("OrgEntityPropertyDescriptor", SerializationFormat.JSON)
class OrgEntityPropertyDescriptorImplSerializer extends BaseJSONSerializer<OrgEntityPropertyDescriptor> implements
    Serializer<OrgEntityPropertyDescriptor, SerializationFormat.JSON>
{
    static readonly KEY: string = "entityPropertyDescriptor";

    getKey(): string
    {
        return OrgDataCoreDefaultImplSerializer.KEY;
    }

    getValue(serializableObject: OrgEntityPropertyDescriptorImpl,
             serializationHelper: SerializationHelper<SerializationFormat.JSON>): Record<string, string>
    {
        const valueToReturn: Record<string, string> = {};

        valueToReturn["name"] = serializableObject.name;
        valueToReturn["title"] = serializableObject.title;
        valueToReturn["defaultValue"] = serializableObject.defaultValue;
        valueToReturn["defaultVisibility"] = serializableObject.defaultVisibility.toString();
        valueToReturn["defaultDisplayOrder"] = serializableObject.defaultVisibility.toString();
        valueToReturn["enabled"] = serializableObject.enabled.toString();
        valueToReturn["canDisable"] = serializableObject.canDisable.toString();

        return valueToReturn;
    }

    deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): OrgEntityPropertyDescriptor
    {

        return new OrgEntityPropertyDescriptorImpl(
            dataObject.name, dataObject.title, dataObject.defaultValue, (dataObject.defaultVisibility === "true"),
            dataObject.defaultDisplayOrder, (dataObject.enabled === "true"), (dataObject.canDelete === "true"));
    }
}

export {
    OrgEntityTypes,
    PropertyCarrierHelper,
    EMPTY_PROPERTY_BAG,
    OrgEntityPropertyDescriptorImpl,
    OrgEntityPropertyDescriptorImplSerializer
};

export type{OrgEntityPropertyBag, OrgEntity, OrgEntityType, OrgEntityPropertyDescriptor, OrgEntityPropertyCarrier};
