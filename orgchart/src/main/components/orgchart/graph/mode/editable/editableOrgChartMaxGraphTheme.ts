import {CellRenderer, type CellStateStyle} from "@maxgraph/core";
import {type OrgEntityColorTheme} from "orgplanner-common/model";

import {OrgChartMaxGraphThemeDefault} from "../../common/themes/orgChartMaxGraphThemeDefault";
import {EditableNoLabelOrgChartShape, EditableOrgChartNodeShape} from "./editableOrgChartNodeShape";

class EditableOrgChartMaxGraphTheme extends OrgChartMaxGraphThemeDefault
{
    static
    {
        //@ts-expect-error - constructor madness in the Shape hierachy.
        CellRenderer.registerShape("EditableOrgChartNodeShape", EditableOrgChartNodeShape);
        //@ts-expect-error - constructor madness in the Shape hierachy.
        CellRenderer.registerShape("EditableNoLabelRectagle", EditableNoLabelOrgChartShape);
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
            cellStateToReturn.shape = "EditableOrgChartNodeShape";
        }
        else
        {
            cellStateToReturn.shape = "EditableNoLabelRectagle";
        }
        return cellStateToReturn;
    }
}

export {EditableOrgChartMaxGraphTheme};