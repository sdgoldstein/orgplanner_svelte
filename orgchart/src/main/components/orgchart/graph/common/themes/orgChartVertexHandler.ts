import {CellState, constants, Rectangle, VertexHandler} from "@maxgraph/core";

import {OrgChartNodeSelectionShapeBase} from "./shape/orgChartNodeSelectionShapeBase";

class OrgChartVertexHandler extends VertexHandler
{
    constructor(state: CellState)
    {
        super(state);
    }

    isSelectionDashed()
    {
        return false;
    }

    createSelectionShape(bounds: Rectangle)
    {
        return new OrgChartNodeSelectionShapeBase(Rectangle.fromRectangle(bounds), constants.NONE,
                                                  this.getSelectionColor(), 3, this.state.style);
    }

    getSelectionBounds(state: CellState)
    {
        // The vertex handler from the codebase does some rounding here.  Not sure why.  I'm removing it here
        return new Rectangle(state.x, state.y, state.width, state.height);
    }
}

export {OrgChartVertexHandler};