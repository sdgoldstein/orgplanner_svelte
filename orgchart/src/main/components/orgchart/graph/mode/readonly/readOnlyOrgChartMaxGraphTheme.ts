import {CellRenderer, type CellStateStyle} from "@maxgraph/core";
import {type OrgEntityColorTheme} from "orgplanner-common/model";

import {OrgChartMaxGraphThemeDefault} from "../../common/themes/orgChartMaxGraphThemeDefault";
import {ReadOnlyOrgChartNodeShape} from "./readOnlyOrgChartNodeShape";

class ReadOnlyOrgChartMaxGraphTheme extends OrgChartMaxGraphThemeDefault
{
    static
    {
        //@ts-expect-error - constructor madness in the Shape hierachy.
        CellRenderer.registerShape("readOnlyOrgChartNodeShape", ReadOnlyOrgChartNodeShape);
    }

    constructor(colorTheme: OrgEntityColorTheme)
    {
        super(colorTheme);
    }

    getStyleForNodeType(nodeType: string): CellStateStyle
    {
        const cellStateToReturn = super.getStyleForNodeType(nodeType);
        cellStateToReturn.shape = "readOnlyOrgChartNodeShape";
        return cellStateToReturn;
    }
}

export {ReadOnlyOrgChartMaxGraphTheme};