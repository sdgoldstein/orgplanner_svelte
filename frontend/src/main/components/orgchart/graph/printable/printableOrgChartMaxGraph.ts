import {ServiceManager} from "@sphyrna/service-manager-ts";
import {OrgPlannerAppServicesConstants} from "@src/services/orgPlannerAppServicesConstants";
import type {OrgStructure} from "orgplanner-common/model";
import type {OrgChartEntityVisibleState} from "../../orgChartViewState";
import type {MaxGraphTheme} from "../common/themes/maxGraphTheme";
import {OrgChartMaxGraphBase} from "../base/orgChartMaxGraphBase";
import type {OrgChartMaxGraphAssemblyService} from "../model/orgChartMaxGraphAssemblyService";

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
        super(element, orgStructure, theme, visibilityState);
    }

    protected getOrgChartMaxGraphAssemblyService(): OrgChartMaxGraphAssemblyService
    {
        return ServiceManager.getService(OrgPlannerAppServicesConstants.ORG_CHART_MAX_GRAPH_ASSEMBLY_SERVICE) as
               OrgChartMaxGraphAssemblyService;
    }
}

export {PrintableOrgChartMaxGraph};
