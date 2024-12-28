
import {type OrgEntityType, OrgEntityTypes} from "../orgStructure/orgEntity";

type ColorHex = `#${string}`;

interface OrgEntityTypeColorAssignment
{
    primary: ColorHex;
    textOnPrimary: ColorHex;
}
interface OrgEntityColorTheme
{
    name: string;
    label: string;

    getColorAssignment(orgEntityType: OrgEntityType): OrgEntityTypeColorAssignment;
}

class DefaultOrgEntityColorThemeImpl implements OrgEntityColorTheme
{
    private readonly _typeToAssignmentMap: Map<OrgEntityType, OrgEntityTypeColorAssignment> =
        new Map<OrgEntityType, OrgEntityTypeColorAssignment>();

    constructor(public name: string, public label: string) {}

    getColorAssignment(orgEntityType: OrgEntityType): OrgEntityTypeColorAssignment
    {
        const valueToReturn = this._typeToAssignmentMap.get(orgEntityType);
        if (valueToReturn === undefined)
        {
            throw new Error(`Color assignment not found for org entity type, ${orgEntityType.name}`);
        }

        return valueToReturn;
    }

    setColorAssignment(orgEntityType: OrgEntityType, colorAssignment: OrgEntityTypeColorAssignment)
    {
        this._typeToAssignmentMap.set(orgEntityType, colorAssignment);
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
        deepBlueTheme.setColorAssignment(OrgEntityTypes.MANAGER, {primary : "#172554", textOnPrimary : "#FFFFFF"});
        deepBlueTheme.setColorAssignment(OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR,
                                         {primary : "#172554", textOnPrimary : "#FFFFFF"});
        deepBlueTheme.setColorAssignment(OrgEntityTypes.TEAM, {primary : "#172554", textOnPrimary : "#FFFFFF"});

        let deepRedTheme: DefaultOrgEntityColorThemeImpl = (this.DEEP_RED_THEME as DefaultOrgEntityColorThemeImpl)
        deepRedTheme.setColorAssignment(OrgEntityTypes.MANAGER, {primary : "#450a0a", textOnPrimary : "#FFFFFF"});
        deepRedTheme.setColorAssignment(OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR,
                                        {primary : "#450a0a", textOnPrimary : "#FFFFFF"});
        deepRedTheme.setColorAssignment(OrgEntityTypes.TEAM, {primary : "#450a0a", textOnPrimary : "#FFFFFF"});

        let deepGreenTheme: DefaultOrgEntityColorThemeImpl = (this.DEEP_GREEN_THEME as DefaultOrgEntityColorThemeImpl)
        deepGreenTheme.setColorAssignment(OrgEntityTypes.MANAGER, {primary : "#052e16", textOnPrimary : "#FFFFFF"});
        deepGreenTheme.setColorAssignment(OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR,
                                          {primary : "#052e16", textOnPrimary : "#FFFFFF"});
        deepGreenTheme.setColorAssignment(OrgEntityTypes.TEAM, {primary : "#052e16", textOnPrimary : "#FFFFFF"});

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

export {OrgEntityColorThemes, DefaultOrgEntityColorThemeImpl};
export type{OrgEntityColorTheme, ColorHex};
