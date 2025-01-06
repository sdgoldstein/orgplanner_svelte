import type {OrgEntityColorTheme, OrgEntityPropertyDescriptor, OrgEntityType, OrgStructure} from "orgplanner-common/model";

interface OrgChartProps
{
    orgStructure: OrgStructure;
    mode: OrgChartMode;
    colorTheme: OrgEntityColorTheme;
    propertyDescriptors: Set<OrgEntityPropertyDescriptor>;
}

enum OrgChartMode {
    READ_ONLY = "READ_ONLY",
    EDIT = "EDIT",
    PRINT = "PRINT"
}

type ViewToggableEntity = OrgEntityPropertyDescriptor|OrgEntityType;

export type{OrgChartProps, ViewToggableEntity};
export {OrgChartMode};