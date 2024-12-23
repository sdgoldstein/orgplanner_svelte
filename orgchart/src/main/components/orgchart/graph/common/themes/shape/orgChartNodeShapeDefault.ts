import {AbstractCanvas2D, Cell, Rectangle, SvgCanvas2D} from "@maxgraph/core";

import {OrgPlannerChartEmployeeVertex, type OrgPlannerChartVertex} from "../../core/orgPlannerChartModel";

import {OrgChartNodeShapeBase} from "./orgChartNodeShapeBase";

class OrgChartNodeShapeDefault extends OrgChartNodeShapeBase
{
    editButtonBounds: Rectangle|undefined;
    deleteButtonBounds: Rectangle|undefined;

    constructor(bounds: Rectangle, fill: string, stroke: string, strokewidth: number|undefined)
    {
        // At runtime, these parameters are all undefined!  Seemed like a bug in the library
        super(bounds, fill, stroke, strokewidth);
    }

    paintBackground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number): void
    {
        super.paintBackground(canvas, x, y, width, height);

        this._paintToggleSubtreeButton(canvas, x, width, y, height);
        this._paintActionButtons(height, canvas, x, width, y);
    }

    private _paintActionButtons(height: number, canvas: AbstractCanvas2D, x: number, width: number, y: number)
    {
        const radius = this._getBaseRoundedCornerRadius(height);

        const size = height / 5;
        const buttonWidth = size;

        const buttonYPos = y + height + size / 6;
        const editButtonXPos = x + width - buttonWidth / 2 - 5;
        this._paintButton(canvas, editButtonXPos, buttonYPos, buttonWidth, size, radius, true);

        const deleteButtonXPos = x + width - buttonWidth / 2 - 10 - size;
        this._paintButton(canvas, deleteButtonXPos, buttonYPos, buttonWidth, size, radius, true);

        const symbolSize = size * .675;
        const svgCanvas: SvgCanvas2D = canvas as SvgCanvas2D;
        svgCanvas.node = svgCanvas.createElement("g", "");

        const deleteButtonIconNode = svgCanvas.createElement("use", "");
        deleteButtonIconNode.setAttribute("href", "symbols.svg#delete");
        deleteButtonIconNode.setAttribute("width", symbolSize.toString());
        deleteButtonIconNode.setAttribute("height", symbolSize.toString());
        deleteButtonIconNode.setAttribute("x", (deleteButtonXPos - symbolSize / 2).toString());
        deleteButtonIconNode.setAttribute("y", (buttonYPos - symbolSize / 2).toString());
        svgCanvas.node.appendChild(deleteButtonIconNode);

        const editButtonIconNode = svgCanvas.createElement("use", "");
        editButtonIconNode.setAttribute("href", "symbols.svg#edit");
        editButtonIconNode.setAttribute("width", symbolSize.toString());
        editButtonIconNode.setAttribute("height", symbolSize.toString());
        editButtonIconNode.setAttribute("x", (editButtonXPos - symbolSize / 2).toString());
        editButtonIconNode.setAttribute("y", (buttonYPos - symbolSize / 2).toString());
        svgCanvas.node.appendChild(editButtonIconNode);

        svgCanvas.fillAndStroke();

        this.editButtonBounds =
            new Rectangle(editButtonXPos - buttonWidth / 2, buttonYPos - size / 2, buttonWidth, size);

        this.deleteButtonBounds =
            new Rectangle(deleteButtonXPos - buttonWidth / 2, buttonYPos - size / 2, buttonWidth, size);
    }

    private _paintToggleSubtreeButton(canvas: AbstractCanvas2D, x: number, width: number, y: number, height: number)
    {
        const radius = this._getBaseRoundedCornerRadius(height) / 2;

        let size = height / 8;

        // state is optional - why?!
        if (this.state)
        {
            const currentCell: Cell = this.state.cell;
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

export {OrgChartNodeShapeDefault};
