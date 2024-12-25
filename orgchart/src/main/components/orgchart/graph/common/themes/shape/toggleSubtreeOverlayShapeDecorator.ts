import type {AbstractCanvas2D, Cell, CellState, CellStateStyle} from "@maxgraph/core";
import type {OrgChartNodeShapeDecorator} from "./orgChartNodeShapeDecorator";
import type {OrgPlannerChartVertex} from "../../core/orgPlannerChartModel";
import {OverlayButtonNodeShapeDecorator} from "./overlayButtonNodeShapeDecorator";

class ToggleSubtreeOveralyShapeDecorator extends OverlayButtonNodeShapeDecorator implements OrgChartNodeShapeDecorator
{
    paintBackground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number, cellState: CellState,
                    cellStyle: CellStateStyle): void
    {
        const radius = this._getBaseRoundedCornerRadius(width, height, cellStyle) / 2;

        const size = 10; // Need a better way to determine this

        const currentCell: Cell = cellState.cell;
        const currentCellValue: OrgPlannerChartVertex = currentCell.value as OrgPlannerChartVertex;
        // FIXME - Need to all determine if this call HAS children
        if (currentCellValue.canBeParent() && this._hasChildren(currentCell))
        {
            this._paintButton(canvas, x + width / 2, y + height, size, size, radius, false);

            canvas.setStrokeWidth(1);
            canvas.begin();
            canvas.moveTo(x + width / 2 - size / 4, y + height);
            canvas.lineTo(x + width / 2 + size / 4, y + height);

            // If collapsed, draw "+"
            if (currentCellValue.hasProperty("collapsed") && currentCellValue.getProperty("collapsed") == "true")
            {
                canvas.moveTo(x + width / 2, y + height - size / 4);
                canvas.lineTo(x + width / 2, y + height + size / 4);
            }
            canvas.fillAndStroke();
        }
    }

    private _hasChildren(cell: Cell): boolean
    {
        let valueToReturn = false;

        const edgeCount = cell.getEdgeCount();
        for (let i = 0; i < edgeCount && !valueToReturn; i++)
        {
            const nextEdge = cell.getEdgeAt(i);
            // If the next edge starts at this cell and there exists a cell at the edge end
            if ((nextEdge.getTerminal(true) === cell) && nextEdge.getTerminal(false))
            {
                valueToReturn = true;
            }
        }

        return valueToReturn;
    }
}

export {ToggleSubtreeOveralyShapeDecorator};