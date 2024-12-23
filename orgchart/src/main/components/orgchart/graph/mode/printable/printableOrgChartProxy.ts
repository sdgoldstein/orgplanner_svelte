import {OrgChartEntityVisibleStateImpl} from "../../../orgChartViewState";

import {PrintableOrgChartMaxGraph} from "./printableOrgChartMaxGraph";
import {PrintableOrgChartMaxGraphTheme} from "./printableOrgChartMaxGraphTheme";

import type {OrgChartProps, OrgChartProxy} from "../../model/orgChartProxy";
import {OrgChartProxyBase} from "../shared/orgChartProxyBase";

class PrintableOrgChartProxy extends OrgChartProxyBase implements OrgChartProxy
{
    onUpdate(orgChartProps: OrgChartProps): void
    {
        if (this.chartContainer === undefined)
        {
            throw new Error("No chart container set");
        }

        const orgChartTheme = new PrintableOrgChartMaxGraphTheme(orgChartProps.colorTheme);
        const visibiltyState = new OrgChartEntityVisibleStateImpl(orgChartProps.propertyDescriptors);
        const graph = new PrintableOrgChartMaxGraph(this.chartContainer, orgChartProps.orgStructure, orgChartTheme,
                                                    visibiltyState);

        graph.renderGraph();
    };
}

export {PrintableOrgChartProxy};
