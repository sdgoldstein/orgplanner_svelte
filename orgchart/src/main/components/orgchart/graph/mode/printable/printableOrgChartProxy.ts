import {OrgChartEntityVisibleStateImpl} from "../../common/core/orgChartViewState";

import {PrintableOrgChartMaxGraph} from "./printableOrgChartMaxGraph";
import {PrintableOrgChartMaxGraphTheme} from "./printableOrgChartMaxGraphTheme";

import type {OrgChartProxy} from "../base/orgChartProxy";
import {OrgChartProxyBase} from "../shared/orgChartProxyBase";
import type {OrgChartProps} from "@src/components/orgchart/orgChart";

class PrintableOrgChartProxy extends OrgChartProxyBase implements OrgChartProxy
{
    onUpdate(orgChartProps: OrgChartProps): void
    {
        if (this.chartContainer === undefined)
        {
            throw new Error("No chart container set");
        }

        // Recreate and redraw on every update?  Not efficient.  FIXME - Look at editable version and try to optimize?
        this.chartContainer.innerHTML = "";
        const orgChartTheme = new PrintableOrgChartMaxGraphTheme(orgChartProps.colorTheme);
        const visibiltyState = new OrgChartEntityVisibleStateImpl(orgChartProps.propertyDescriptors);
        const graph = new PrintableOrgChartMaxGraph(this.chartContainer, orgChartProps.orgStructure, orgChartTheme,
                                                    visibiltyState);

        graph.renderGraph();
    };
}

export {PrintableOrgChartProxy};
