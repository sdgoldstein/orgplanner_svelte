import {CellState, VertexHandler} from "@maxgraph/core";

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
}

export {OrgChartVertexHandler};