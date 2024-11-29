import type {OrgStructure, OrgEntityColorTheme, OrgEntityPropertyDescriptor} from "orgplanner-common/model";
import {OrgChartEntityVisibleStateImpl} from "../../orgChartViewState";
import {PrintableOrgChartMaxGraphTheme} from "../common/themes/printableOrgChartMaxGraphTheme";
import {PrintableOrgChartMaxGraph} from "./printableOrgChartMaxGraph";

class PrintableOrgChartProxy
{
    constructor(private _chartContainer: HTMLElement, orgStructure: OrgStructure, colorTheme: OrgEntityColorTheme,
                propertyDescriptors: Set<OrgEntityPropertyDescriptor>)
    {
        const orgChartTheme = new PrintableOrgChartMaxGraphTheme(colorTheme);
        const visibiltyState = new OrgChartEntityVisibleStateImpl(propertyDescriptors);
        let graph = new PrintableOrgChartMaxGraph(this._chartContainer, orgStructure, orgChartTheme, visibiltyState);

        graph.renderGraph();
    };
}

export {PrintableOrgChartProxy};
