import {CellOverlay, ImageBox, Point, type AlignValue, type VAlignValue, CellState, Rectangle} from "@maxgraph/core";
import {OrgChartNodeShapeDefault} from "./orgChartNodeShapeDefault";

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
}

class DeleteButtonCellOverlay extends DefaultOrgChartCellOverlay implements OrgChartCellOverlay
{
    constructor(image: ImageBox, tooltip?: string|null, align?: AlignValue, verticalAlign?: VAlignValue, offset?: Point,
                cursor?: string)
    {
        super("DeleteButtonOverlay", image, tooltip, align, verticalAlign, offset, cursor);
    }
}

export {DefaultOrgChartCellOverlay, EditButtonCellOverlay, DeleteButtonCellOverlay};
export type{OrgChartCellOverlay};