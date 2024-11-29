
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
}

interface OrgEntityPropertyCarrier
{
    getPropertyValue(propertyName: string): string;
    setPropertyValue(propertyName: string, value: string): void;
    propertyIterator(): IterableIterator<[ OrgEntityPropertyDescriptor, string ]>;
}
type OrgEntityPropertyBag = Map<OrgEntityPropertyDescriptor, string>;
const EMPTY_PROPERTY_BAG: OrgEntityPropertyBag = new Map();

/**
 * This class can be used as a helper using composition.  (I
 * wasn't able to get mixins to work as I would have liked)
 */
class PropertyCarrierHelper implements OrgEntityPropertyCarrier
{
    private readonly _properties: Map<OrgEntityPropertyDescriptor, string> =
        new Map<OrgEntityPropertyDescriptor, string>();
    private readonly _propertyDescriptors: Map<string, OrgEntityPropertyDescriptor> =
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
        const propertyDescriptor = this._propertyDescriptors.get(propertyName);
        if (propertyDescriptor === undefined)
        {
            throw new Error("Property does not exist: " + propertyName);
        }

        const valueToReturn = this._properties.get(propertyDescriptor);
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

export {OrgEntityTypes, PropertyCarrierHelper, EMPTY_PROPERTY_BAG};

export type{OrgEntityPropertyBag, OrgEntity, OrgEntityType, OrgEntityPropertyDescriptor, OrgEntityPropertyCarrier};
