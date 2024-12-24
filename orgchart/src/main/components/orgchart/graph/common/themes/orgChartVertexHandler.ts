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

    // THIS IS WHERE WE WOULD CHANGE SELECTION COLOR AND SHAPE
}

export {OrgChartVertexHandler};