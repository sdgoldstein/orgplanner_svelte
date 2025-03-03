import {CellRenderer, type CellStateStyle} from "@maxgraph/core";
import {type OrgEntityColorTheme} from "orgplanner-common/model";

import {OrgChartMaxGraphThemeDefault} from "../../common/themes/orgChartMaxGraphThemeDefault";
import {PrintableOrgChartNodeShape} from "./printableOrgChartNodeShape";
import {NoLabelOrgChartShape} from "../../common/themes/shape/noLabelOrgChartShape";

class PrintableOrgChartMaxGraphTheme extends OrgChartMaxGraphThemeDefault
{
    static
    {

        //@ts-expect-error - constructor madness in the Shape hierachy.
        CellRenderer.registerShape("printableOrgChartNodeShape", PrintableOrgChartNodeShape);

        //@ts-expect-error - constructor madness in the Shape hierachy.
        CellRenderer.registerShape("noLabelRectagle", NoLabelOrgChartShape);
    }

    constructor(colorTheme: OrgEntityColorTheme)
    {
        super(colorTheme);
    }

    getStyleForNodeType(nodeType: string): CellStateStyle
    {
        const cellStateToReturn = super.getStyleForNodeType(nodeType);
        if (nodeType !== "team")
        {
            cellStateToReturn.shape = "printableOrgChartNodeShape";
        }
        else
        {
            cellStateToReturn.shape = "noLabelRectagle";
        }
        return cellStateToReturn;
    }
}

export {PrintableOrgChartMaxGraphTheme};
