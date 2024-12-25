import {CellRenderer, type CellStateStyle} from "@maxgraph/core";
import {type OrgEntityColorTheme} from "orgplanner-common/model";

import {OrgChartMaxGraphThemeDefault} from "../../common/themes/orgChartMaxGraphThemeDefault";
import {ReadOnlyOrgChartNodeShape, ReadOnlyNoLabelOrgChartShape} from "./readOnlyOrgChartNodeShape";

class ReadOnlyOrgChartMaxGraphTheme extends OrgChartMaxGraphThemeDefault
{
    static
    {
        //@ts-expect-error - constructor madness in the Shape hierachy.
        CellRenderer.registerShape("readOnlyOrgChartNodeShape", ReadOnlyOrgChartNodeShape);
        //@ts-expect-error - constructor madness in the Shape hierachy.
        CellRenderer.registerShape("readOnlyNoLabelRectagle", ReadOnlyNoLabelOrgChartShape);
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
            cellStateToReturn.shape = "readOnlyOrgChartNodeShape";
        }
        else
        {
            cellStateToReturn.shape = "readOnlyNoLabelRectagle";
        }
        return cellStateToReturn;
    }
}

export {ReadOnlyOrgChartMaxGraphTheme};