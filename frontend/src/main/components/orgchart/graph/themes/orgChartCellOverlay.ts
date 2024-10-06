import {
    CellOverlay,
    ImageBox,
    Point,
    type AlignValue,
    type VAlignValue,
    constants,
    CellState,
    Rectangle
} from "@maxgraph/core";
import type {OrgChartNodeShape} from "./orgChartNodeShape";

interface OrgChartCellOverlay
{
    name: string;
}

class DefaultOrgChartCellOverlay extends CellOverlay implements OrgChartCellOverlay
{
    constructor(public name: string, image: ImageBox, tooltip?: string|null, align?: AlignValue,
                verticalAlign?: VAlignValue, offset?: Point, cursor?: string)
    {
        super(image, tooltip, align, verticalAlign, offset, cursor);
    }
}

class EditButtonCellOverlay extends DefaultOrgChartCellOverlay implements OrgChartCellOverlay
{
    constructor(image: ImageBox, tooltip?: string|null, align?: AlignValue, verticalAlign?: VAlignValue, offset?: Point,
                cursor?: string)
    {
        super("EditButtonOverlay", image, tooltip, align, verticalAlign, offset, cursor);
    }

    getBounds(state: CellState): Rectangle
    {
        return (state.shape as OrgChartNodeShape).editButtonBounds!;
    }
}

class DeleteButtonCellOverlay extends DefaultOrgChartCellOverlay implements OrgChartCellOverlay
{
    constructor(image: ImageBox, tooltip?: string|null, align?: AlignValue, verticalAlign?: VAlignValue, offset?: Point,
                cursor?: string)
    {
        super("DeleteButtonOverlay", image, tooltip, align, verticalAlign, offset, cursor);
    }

    getBounds(state: CellState): Rectangle
    {
        return (state.shape as OrgChartNodeShape).deleteButtonBounds!;
    }
}

export {DefaultOrgChartCellOverlay, EditButtonCellOverlay, DeleteButtonCellOverlay};
export type{OrgChartCellOverlay};