
import type {NodeLayoutMetadata} from "./nodeLayoutMetadata";
import {OrgPlannerChartLayout} from "./orgPlannerChartLayout";

class AttachToGridStep
{
    private readonly _layout: OrgPlannerChartLayout;

    constructor(layout: OrgPlannerChartLayout)
    {
        this._layout = layout;
    }

    private get layout(): OrgPlannerChartLayout
    {
        return this._layout;
    }

    public attachLayoutToGrid(nodeMetadata: NodeLayoutMetadata): void
    {
        this.attachNodeToGrid(nodeMetadata, 0);
    }

    private attachNodeToGrid(nodeMetadata: NodeLayoutMetadata, xAdjustment: number): void
    {
        console.trace(
            `Attaching layout to grid for node, ${nodeMetadata.cell.value}, with X adjustment, ${xAdjustment}`);

        // const gridOrigin = [ this.graph.gridSize, this.graph.gridSize ];
        const gridOrigin = [ 0, 0 ];

        const xPosition = nodeMetadata.relativeX + gridOrigin[0] + xAdjustment + this.layout.leafEdgeLeftOffset;
        const yPosition = nodeMetadata.relativeY + gridOrigin[1];

        const cell = nodeMetadata.cell;
        // this.graph.cellsOrdered(cell, false); // FIX ME - What did this line do originally
        this.layout.setVertexLocation(cell, xPosition, yPosition);

        console.trace(`Set node location to, [${xPosition}, ${yPosition}}]`);

        let cellGeo = cell.getGeometry();
        if (!cellGeo)
        {
            // Shouldn't happpen?
            throw Error("null cell geometry");
        }
        cellGeo = cellGeo.clone();
        cellGeo.width = nodeMetadata.width;
        this.layout.graph.model.setGeometry(cell, cellGeo);

        console.trace(`Set node width to, ${cellGeo.width}`);
        xAdjustment += nodeMetadata.xAdjustment;

        const targetNodes = nodeMetadata.childNodes;
        for (const nextTargetNode of targetNodes)
        {
            this.attachNodeToGrid(nextTargetNode, xAdjustment);
        }
    }
}

export {AttachToGridStep};