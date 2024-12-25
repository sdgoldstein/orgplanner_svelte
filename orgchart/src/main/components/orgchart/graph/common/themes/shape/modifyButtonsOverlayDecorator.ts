import type {AbstractCanvas2D, CellState, CellStateStyle, SvgCanvas2D} from "@maxgraph/core";
import {OverlayButtonNodeShapeDecorator} from "./overlayButtonNodeShapeDecorator";

class ModifyButtonsOverlayDecorator extends OverlayButtonNodeShapeDecorator
{
    paintBackground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number, state: CellState,
                    style: CellStateStyle): void
    {
        this._paintActionButtons(height, canvas, x, width, y, state, style);
    }

    private _paintActionButtons(height: number, canvas: AbstractCanvas2D, x: number, width: number, y: number,
                                state: CellState, style: CellStateStyle)
    {
        const radius = this._getBaseRoundedCornerRadius(width, height, style!);

        const size = 20; // Need a better way to determine this
        const buttonWidth = size;

        const buttonYPos = y + height + size / 6;
        const editButtonXPos = x + width - buttonWidth / 2 - 5;
        this._paintButton(canvas, editButtonXPos, buttonYPos, buttonWidth, size, radius, true);

        const deleteButtonXPos = x + width - buttonWidth / 2 - 10 - size;
        this._paintButton(canvas, deleteButtonXPos, buttonYPos, buttonWidth, size, radius, true);

        canvas.save();

        canvas.setFillColor("#FFFFFF"); // We fill with white.  Should be the font color?

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

        canvas.restore();
    }
}

export {ModifyButtonsOverlayDecorator};