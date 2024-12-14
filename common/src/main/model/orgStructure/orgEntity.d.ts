interface OrgEntityType {
    name: string;
    label: string;
}
declare class OrgEntityTypes {
    private static readonly NAME_TO_TYPE_MAP;
    static readonly MANAGER: OrgEntityType;
    static readonly INDIVIDUAL_CONTRIBUTOR: OrgEntityType;
    static readonly TEAM: OrgEntityType;
    static getTypeByName(name: string): OrgEntityType;
    static typeIterator(): IterableIterator<OrgEntityType>;
}
interface OrgEntity {
    readonly id: string;
    orgEntityType: OrgEntityType;
}
interface OrgEntityPropertyCarrier {
    getPropertyValue(propertyName: string): string;
    setPropertyValue(propertyName: string, value: string): void;
    propertyIterator(): IterableIterator<[OrgEntityPropertyDescriptor, string]>;
}
type OrgEntityPropertyBag = Map<OrgEntityPropertyDescriptor, string>;
declare const EMPTY_PROPERTY_BAG: OrgEntityPropertyBag;
/**
 * This class can be used as a helper using composition.  (I
 * wasn't able to get mixins to work as I would have liked)
 */
declare class PropertyCarrierHelper implements OrgEntityPropertyCarrier {
    private readonly _properties;
    private readonly _propertyDescriptors;
    constructor(propertyDescriptors: Set<OrgEntityPropertyDescriptor>, properties: OrgEntityPropertyBag);
    getPropertyValue(propertyName: string): string;
    setPropertyValue(propertyName: string, value: string): void;
    propertyIterator(): IterableIterator<[OrgEntityPropertyDescriptor, string]>;
}
interface OrgEntityPropertyDescriptor {
    name: string;
    title: string;
    defaultValue: string;
    enabled: boolean;
}
export { OrgEntityTypes, PropertyCarrierHelper, EMPTY_PROPERTY_BAG };
export type { OrgEntityPropertyBag, OrgEntity, OrgEntityType, OrgEntityPropertyDescriptor, OrgEntityPropertyCarrier };
//# sourceMappingURL=orgEntity.d.ts.map