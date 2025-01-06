import type {OrgStructure} from "orgplanner-common/model";
import type {OrgChartEntityVisibleState} from "../../common/core/orgChartViewState";
import type {MaxGraphTheme} from "../../common/themes/maxGraphTheme";
import {OrgChartMaxGraphBase} from "../shared/orgChartMaxGraphBase";
import {PrintableOrgChartMaxGraphAssemblyService} from "./printableOrgChartMaxGraphAssemblyService";

/**
 * The org chart graph visual component.
 *
 * It delegates to the OrgChartMaxGraphAssemblyService to add or remove visual elements to the graph.  Otherwise, all
 * other actions/logic it handles directly.  It also is responsible for directly updated the underlying orgstructure
 * when changs occur
 */
class PrintableOrgChartMaxGraph extends OrgChartMaxGraphBase
{

    constructor(element: HTMLElement, orgStructure: OrgStructure, theme: MaxGraphTheme,
                visibilityState: OrgChartEntityVisibleState)
    {
        super(element, orgStructure, theme, visibilityState, new PrintableOrgChartMaxGraphAssemblyService());
    }
}

export {PrintableOrgChartMaxGraph};
