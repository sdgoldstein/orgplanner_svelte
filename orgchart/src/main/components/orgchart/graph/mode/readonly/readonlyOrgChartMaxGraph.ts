import type {OrgStructure} from "orgplanner-common/model";
import type {OrgChartEntityVisibleState} from "../../../orgChartViewState";
import type {MaxGraphTheme} from "../../common/themes/maxGraphTheme";
import {OrgChartMaxGraphBase} from "../shared/orgChartMaxGraphBase";
import {ReadOnlyOrgChartMaxGraphAssemblyService} from "./readOnlyOrgChartMaxGraphAssemblyService";
import type {CellState, VertexHandler} from "@maxgraph/core";
import {OrgChartVertexHandler} from "../../common/themes/orgChartVertexHandler";

/**
 * The org chart graph visual component.
 *
 * It delegates to the OrgChartMaxGraphAssemblyService to add or remove visual elements to the graph.  Otherwise, all
 * other actions/logic it handles directly.  It also is responsible for directly updated the underlying orgstructure
 * when changs occur
 */
class ReadOnlyOrgChartMaxGraph extends OrgChartMaxGraphBase
{

    constructor(element: HTMLElement, orgStructure: OrgStructure, theme: MaxGraphTheme,
                visibilityState: OrgChartEntityVisibleState)
    {
        super(element, orgStructure, theme, visibilityState, new ReadOnlyOrgChartMaxGraphAssemblyService());
    }

    createVertexHandler(state: CellState): VertexHandler
    {
        return new OrgChartVertexHandler(state);
    }
}

export {ReadOnlyOrgChartMaxGraph};
