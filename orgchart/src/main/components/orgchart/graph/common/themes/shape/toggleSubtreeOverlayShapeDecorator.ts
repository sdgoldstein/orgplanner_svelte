import type {AbstractCanvas2D, Cell, CellState, CellStateStyle} from "@maxgraph/core";
import type {OrgChartNodeShapeDecorator} from "./orgChartNodeShapeDecorator";
import type {OrgPlannerChartVertex} from "../../core/orgPlannerChartModel";

class ToggleSubtreeOveralyShapeDecorator implements OrgChartNodeShapeDecorator
{
    private _baseRoundedCornerRadius: number = -1;

    paintBackground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number, cellState: CellState,
                    cellStyle: CellStateStyle): void
    {
        const radius = this._getBaseRoundedCornerRadius(height, cellStyle) / 2;

        let size = height / 8;

        // state is optional - why?!
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

    paintForeground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number, cellState: CellState,
                    cellStyle: CellStateStyle): void
    {
        // TODO
    }

    private _paintButton(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number, radius: number,
                         filled: boolean)
    {
        canvas.save();

        canvas.setStrokeWidth(1);
        canvas.setStrokeAlpha(0.5);
        canvas.roundrect(x - width / 2, y - height / 2, width, height, radius, radius);
        canvas.fillAndStroke();

        if (filled)
        {
            canvas.setFillColor(canvas.state.strokeColor);
            canvas.setStrokeColor(canvas.state.fillColor);
            canvas.roundrect(x - width / 2, y - height / 2, width, height, radius, radius);
            canvas.fillAndStroke();
        }

        canvas.restore();
    }

    protected _getBaseRoundedCornerRadius(height: number, cellStyle: CellStateStyle): number
    {
        // Calcualte it once and cache it.  It's therefore consistent and faster
        if (this._baseRoundedCornerRadius == -1)
        {
            const f = (cellStyle.arcSize ?? 0.15 * 100) / 100;
            this._baseRoundedCornerRadius = height * f;
        }

        return this._baseRoundedCornerRadius;
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