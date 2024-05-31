import {GuardedMap} from "@sphyrna/tscore";

interface OrgEntityType
{
    name: string;
    label: string;
}

class OrgEntityTypes
{
    private static readonly NAME_TO_TYPE_MAP: GuardedMap<string, OrgEntityType> = new Map<string, OrgEntityType>();

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
        if (!this.NAME_TO_TYPE_MAP.has(name))
        {
            throw new Error("Type by name not found, " + name);
        }

        return this.NAME_TO_TYPE_MAP.get(name);
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
}

interface OrgEntityPropertyCarrier
{
    getPropertyValue(propertyName: string): string;
    setPropertyValue(propertyName: string, value: string): void;
    propertyIterator(): IterableIterator<[ OrgEntityPropertyDescriptor, string ]>;
}
type OrgEntityPropertyBag = GuardedMap<OrgEntityPropertyDescriptor, string>;
const EMPTY_PROPERTY_BAG: OrgEntityPropertyBag = new Map();

/**
 * This class can be used as a helper using composition.  (I
 * wasn't able to get mixins to work as I would have liked)
 */
class PropertyCarrierHelper implements OrgEntityPropertyCarrier
{
    private readonly _properties: GuardedMap<OrgEntityPropertyDescriptor, string> =
        new Map<OrgEntityPropertyDescriptor, string>();
    private readonly _propertyDescriptors: GuardedMap<string, OrgEntityPropertyDescriptor> =
        new Map<string, OrgEntityPropertyDescriptor>();

    constructor(propertyDescriptors: Set<OrgEntityPropertyDescriptor>, properties: OrgEntityPropertyBag)
    {
        for (const nextPropertyDescriptor of propertyDescriptors)
        {
            this._propertyDescriptors.set(nextPropertyDescriptor.name, nextPropertyDescriptor);
            this._properties.set(nextPropertyDescriptor, nextPropertyDescriptor.defaultValue);
        }

        for (const nextProperty of properties)
        {
            this.setPropertyValue(nextProperty[0].name, nextProperty[1]);
        }

        // this._propertyDescriptors = propertyDescriptors;
    }

    getPropertyValue(propertyName: string): string
    {
        if (!this._propertyDescriptors.has(propertyName))
        {
            throw new Error("Property does not exist: " + propertyName);
        }

        const propertyDescriptor: OrgEntityPropertyDescriptor = this._propertyDescriptors.get(propertyName);
        if (!this._properties.has(propertyDescriptor))
        {
            throw new Error("Unepxecged condition:  Property value does not exist for property: " + propertyName);
        }

        return this._properties.get(propertyDescriptor);
    }

    setPropertyValue(propertyName: string, value: string): void
    {
        if (!this._propertyDescriptors.has(propertyName))
        {
            throw new Error("Property does not exist: " + propertyName);
        }

        const propertyDescriptor: OrgEntityPropertyDescriptor = this._propertyDescriptors.get(propertyName);
        this._properties.set(propertyDescriptor, value);
    }

    propertyIterator(): IterableIterator<[ OrgEntityPropertyDescriptor, string ]>
    {
        return this._properties.entries();
    }
}

interface OrgEntityPropertyDescriptor
{
    name: string;
    title: string;
    defaultValue: string;
    enabled: boolean;
}

export {
    OrgEntity,
    OrgEntityType,
    OrgEntityTypes,
    OrgEntityPropertyDescriptor,
    OrgEntityPropertyCarrier,
    PropertyCarrierHelper,
    EMPTY_PROPERTY_BAG
};
export type {OrgEntityPropertyBag};
