
import {
    BaseJSONSerializer,
    JSONSerializationHelper,
    RegisterSerializable,
    RegisterSerializer,
    SerializationFormat,
    type Serializable,
    type Serializer
} from "orgplanner-common/jscore";
import {type OrgEntityType, OrgEntityTypes} from "../orgStructure/orgEntity";

type ColorHex = `#${string}`;

interface OrgEntityTypeColorAssignment
{
    primary: ColorHex;
    textOnPrimary: ColorHex;
}

// FIXME - Serialization for these simple classes shouldn't be this hard.  It's not a lot of code, but why is code
// required at all?
@RegisterSerializable("OrgEntityTypeColorAssignment", 1)
class OrgEntityTypeColorAssignmentImpl implements OrgEntityTypeColorAssignment
{
    constructor(public primary: ColorHex, public textOnPrimary: ColorHex) {}
}

@RegisterSerializer("OrgEntityTypeColorAssignment", SerializationFormat.JSON)
class OrgEntityTypeColorAssignmentImplSerializer extends BaseJSONSerializer<OrgEntityTypeColorAssignment> implements
    Serializer<OrgEntityTypeColorAssignment, SerializationFormat.JSON>
{
    deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): OrgEntityTypeColorAssignment
    {
        return new OrgEntityTypeColorAssignmentImpl(dataObject.primary, dataObject.textOnPrimary);
    }
}

interface OrgEntityColorTheme
{
    name: string;
    label: string;

    getColorAssignment(orgEntityType: OrgEntityType): OrgEntityTypeColorAssignment;
}

@RegisterSerializable("OrgEntityColorTheme", 1)
class DefaultOrgEntityColorThemeImpl implements OrgEntityColorTheme
{
    private readonly _typeToAssignmentMap: Map<string, OrgEntityTypeColorAssignment> =
        new Map<string, OrgEntityTypeColorAssignment>();

    constructor(public name: string, public label: string) {}

    getColorAssignment(orgEntityType: OrgEntityType): OrgEntityTypeColorAssignment
    {
        const valueToReturn = this._typeToAssignmentMap.get(orgEntityType.name);
        if (valueToReturn === undefined)
        {
            throw new Error(`Color assignment not found for org entity type, ${orgEntityType.name}`);
        }

        return valueToReturn;
    }

    setColorAssignment(orgEntityType: OrgEntityType, colorAssignment: OrgEntityTypeColorAssignment)
    {
        this._typeToAssignmentMap.set(orgEntityType.name, colorAssignment);
    }
}

@RegisterSerializer("OrgEntityColorTheme", SerializationFormat.JSON)
class DefaultOrgEntityColorThemeImplSerializer extends BaseJSONSerializer<OrgEntityColorTheme> implements
    Serializer<OrgEntityColorTheme, SerializationFormat.JSON>
{
    getValue(serializableObject: OrgEntityColorTheme, serializationHelper: JSONSerializationHelper): Record<string, any>
    {
        const valueToReturn: Record<string, any> = {};

        valueToReturn["name"] = serializableObject.name;
        valueToReturn["label"] = serializableObject.label;

        // FIXME - Need a better way to handle Maps
        const typeToAssignmentJSONArray: Array<string> = new Array<string>();
        for (const nextOrgEntityType of OrgEntityTypes.typeIterator())
        {
            const nextColorAssignment: OrgEntityTypeColorAssignment =
                serializableObject.getColorAssignment(nextOrgEntityType);

            // @ts-ignore FIXME - This is a hack to get the JSON to serialize correctly
            typeToAssignmentJSONArray.push(`{"${nextOrgEntityType.name}": ${
                serializationHelper.serialize(nextColorAssignment as unknown as Serializable)}}`);
        }
        valueToReturn["orgTypeToColorAssignmentMap"] =
            this.serializeIterable(typeToAssignmentJSONArray[Symbol.iterator](), serializationHelper);

        return valueToReturn;
    }

    deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): OrgEntityColorTheme
    {
        const name: string = dataObject.name;
        const label: string = dataObject.label;

        const colorTheme: DefaultOrgEntityColorThemeImpl = new DefaultOrgEntityColorThemeImpl(name, label);

        const typeToAssignmentMap = dataObject.orgTypeToColorAssignmentMap;
        for (const nextAssignment of typeToAssignmentMap)
        {
            // FIXME - This is ugly.  The map keys have been conversted to properties of the object
            Object.entries(nextAssignment).forEach(([ key, value ]) => {
                colorTheme.setColorAssignment(
                    OrgEntityTypes.getTypeByName(key),
                    serializationHelper.deserializeObject<OrgEntityTypeColorAssignment>(value));
            });
        }

        return colorTheme;
    }
}

class OrgEntityColorThemes
{
    private static readonly NAME_TO_THEME_MAP: Map<string, OrgEntityColorTheme> =
        new Map<string, OrgEntityColorTheme>();

    static readonly DEEP_BLUE_THEME: OrgEntityColorTheme =
        new DefaultOrgEntityColorThemeImpl("DEEP_BLUE_THEME", "Deep Blue");
    static readonly DEEP_RED_THEME: OrgEntityColorTheme =
        new DefaultOrgEntityColorThemeImpl("DEEP_RED_THEME", "Deep Red");
    static readonly DEEP_GREEN_THEME: OrgEntityColorTheme =
        new DefaultOrgEntityColorThemeImpl("DEEP_GREEN_THEME", "Deep Green");

    static
    {
        /* A bit ugly here in that we're type casting, but not sure of a better way to handle this without passing a
         * mapping in the constructor */
        let deepBlueTheme: DefaultOrgEntityColorThemeImpl = (this.DEEP_BLUE_THEME as DefaultOrgEntityColorThemeImpl)
        deepBlueTheme.setColorAssignment(OrgEntityTypes.MANAGER,
                                         new OrgEntityTypeColorAssignmentImpl("#172554", "#FFFFFF"));
        deepBlueTheme.setColorAssignment(OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR,
                                         new OrgEntityTypeColorAssignmentImpl("#1e3a8a", "#FFFFFF"));
        deepBlueTheme.setColorAssignment(OrgEntityTypes.TEAM,
                                         new OrgEntityTypeColorAssignmentImpl("#172554", "#FFFFFF"));

        let deepRedTheme: DefaultOrgEntityColorThemeImpl = (this.DEEP_RED_THEME as DefaultOrgEntityColorThemeImpl)
        deepRedTheme.setColorAssignment(OrgEntityTypes.MANAGER,
                                        new OrgEntityTypeColorAssignmentImpl("#450a0a", "#FFFFFF"));
        deepRedTheme.setColorAssignment(OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR,
                                        new OrgEntityTypeColorAssignmentImpl("#7f1d1d", "#FFFFFF"));
        deepRedTheme.setColorAssignment(OrgEntityTypes.TEAM,
                                        new OrgEntityTypeColorAssignmentImpl("#450a0a", "#FFFFFF"));

        let deepGreenTheme: DefaultOrgEntityColorThemeImpl = (this.DEEP_GREEN_THEME as DefaultOrgEntityColorThemeImpl)
        deepGreenTheme.setColorAssignment(OrgEntityTypes.MANAGER,
                                          new OrgEntityTypeColorAssignmentImpl("#052e16", "#FFFFFF"));
        deepGreenTheme.setColorAssignment(OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR,
                                          new OrgEntityTypeColorAssignmentImpl("#14532d", "#FFFFFF"));
        deepGreenTheme.setColorAssignment(OrgEntityTypes.TEAM,
                                          new OrgEntityTypeColorAssignmentImpl("#052e16", "#FFFFFF"));

        OrgEntityColorThemes.NAME_TO_THEME_MAP.set(this.DEEP_BLUE_THEME.name, this.DEEP_BLUE_THEME);
        OrgEntityColorThemes.NAME_TO_THEME_MAP.set(this.DEEP_RED_THEME.name, this.DEEP_RED_THEME);
        OrgEntityColorThemes.NAME_TO_THEME_MAP.set(this.DEEP_GREEN_THEME.name, this.DEEP_GREEN_THEME);
    }

    static getColorThemeByName(name: string): OrgEntityColorTheme
    {
        const valueToReturn = this.NAME_TO_THEME_MAP.get(name);
        if (valueToReturn === undefined)
        {
            throw new Error(`Color theme by name not found, ${name}`);
        }

        return valueToReturn;
    }

    static themeIterator(): IterableIterator<OrgEntityColorTheme>
    {
        return this.NAME_TO_THEME_MAP.values();
    }
}

export {
    OrgEntityColorThemes,
    DefaultOrgEntityColorThemeImpl,
    DefaultOrgEntityColorThemeImplSerializer,
    OrgEntityTypeColorAssignmentImplSerializer
};
export type{OrgEntityColorTheme, ColorHex};
