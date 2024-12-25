import {AbstractCanvas2D, Rectangle, SvgCanvas2D} from "@maxgraph/core";

import {OrgChartNodeShapeBase} from "./orgChartNodeShapeBase";
import {ToggleSubtreeOveralyShapeDecorator} from "./toggleSubtreeOverlayShapeDecorator";

// FIXME - turn these into Decorators
class OrgChartNodeShapeDefault extends OrgChartNodeShapeBase
{
    editButtonBounds: Rectangle|undefined;
    deleteButtonBounds: Rectangle|undefined;

    constructor(bounds: Rectangle, fill: string, stroke: string, strokewidth: number|undefined)
    {
        // At runtime, these parameters are all undefined!  Seemed like a bug in the library
        super(bounds, fill, stroke, strokewidth);

        this.registerDecorator(new ToggleSubtreeOveralyShapeDecorator());
    }

    paintBackground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number): void
    {
        super.paintBackground(canvas, x, y, width, height);

        // this._paintToggleSubtreeButton(canvas, x, width, y, height);
        this._paintActionButtons(height, canvas, x, width, y);
    }

    private _paintActionButtons(height: number, canvas: AbstractCanvas2D, x: number, width: number, y: number)
    {
        const radius = this._getBaseRoundedCornerRadius(width, height, this.style!);

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
}

export {OrgChartNodeShapeDefault};
