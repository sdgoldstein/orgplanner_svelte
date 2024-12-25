import {CellOverlay, ImageBox, Point, type AlignValue, type VAlignValue, CellState, Rectangle} from "@maxgraph/core";

// FIXME - Note the bound have to match what's in the ModifyButtonsOverlayDecorator.  MaxGraph only supports image
// overalays, so we need to put in transparent image and then the shape paints under it

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
        const size = 20; // Need a better way to determine this.  Matches the ModifyButtonsOverlayDecorator

        return new Rectangle(state.x + state.width - size - 5, state.y + state.height - size / 3, size, size);
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
        const size = 20; // Need a better way to determine this.  Matches the ModifyButtonsOverlayDecorator

        return new Rectangle(state.x + state.width - 2 * size - 10, state.y + state.height - size / 3, size, size);
    }
}

export {DefaultOrgChartCellOverlay, EditButtonCellOverlay, DeleteButtonCellOverlay};
export type{OrgChartCellOverlay};