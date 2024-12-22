import type {OrgEntityPropertyDescriptor, OrgStructure, OrgEntityColorTheme} from "orgplanner-common/model";
import type {OrgChartMode} from "../../orgChartViewState";

interface OrgChartProps
{
    orgStructure: OrgStructure;
    mode: OrgChartMode;
    colorTheme: OrgEntityColorTheme;
    propertyDescriptors: Set<OrgEntityPropertyDescriptor>;
}

interface OrgChartProxy
{
    onMount(): void;
    onDismount(): void;
    onUpdate(orgChartProps: OrgChartProps): void;
}

export type{OrgChartProxy, OrgChartProps};