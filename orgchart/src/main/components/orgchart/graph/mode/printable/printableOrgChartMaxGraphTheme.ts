import {CellRenderer, type CellStateStyle} from "@maxgraph/core";
import {type OrgEntityColorTheme} from "orgplanner-common/model";

import {OrgChartMaxGraphThemeDefault} from "../../common/themes/orgChartMaxGraphThemeDefault";
import {PrintableOrgChartNodeShape} from "./printableOrgChartNodeShape";

class PrintableOrgChartMaxGraphTheme extends OrgChartMaxGraphThemeDefault
{
    static
    {

        //@ts-expect-error - constructor madness in the Shape hierachy.
        CellRenderer.registerShape("printableOrgChartNodeShape", PrintableOrgChartNodeShape);
    }

    constructor(colorTheme: OrgEntityColorTheme)
    {
        super(colorTheme);
    }

    getStyleForNodeType(nodeType: string): CellStateStyle
    {
        const cellStateToReturn = super.getStyleForNodeType(nodeType);
        cellStateToReturn.shape = "printableOrgChartNodeShape";
        return cellStateToReturn;
    }
}

export {PrintableOrgChartMaxGraphTheme};
