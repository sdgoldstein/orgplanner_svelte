import type {AbstractCanvas2D, CellState, CellStateStyle, ColorValue, SvgCanvas2D} from "@maxgraph/core";
import {OverlayButtonNodeShapeDecorator} from "./overlayButtonNodeShapeDecorator";
import type {OrgChartMaxGraphThemeCellStateStyle} from "../orgChartMaxGraphThemeDefault";

class ModifyButtonsOverlayDecorator extends OverlayButtonNodeShapeDecorator
{
    paintBackground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number, state: CellState,
                    style: CellStateStyle): void
    {
        const radius = this._getBaseRoundedCornerRadius(width, height, style!);

        const size = 20; // Need a better way to determine this
        const buttonWidth = size;

        const buttonYPos = y + height + size / 6;

        if (state.cell.value.orgEntity.canDelete())
        {
            this._paintDeleteutton(height, canvas, x, width, y, state, style, radius, size, buttonWidth, buttonYPos);
        }
        this._paintEditButton(height, canvas, x, width, y, state, style, radius, size, buttonWidth, buttonYPos);
    }

    private _paintEditButton(height: number, canvas: AbstractCanvas2D, x: number, width: number, y: number,
                             state: CellState, style: CellStateStyle, radius: number, size: number, buttonWidth: number,
                             buttonYPos: number)
    {
        const fontColor: ColorValue = (style as OrgChartMaxGraphThemeCellStateStyle).textOnActionColor ?? "#FFFFFF";
        const strokeColor: ColorValue =
            ((style as OrgChartMaxGraphThemeCellStateStyle).actionColor ?? style.strokeColor) as ColorValue;

        const editButtonXPos = x + width - buttonWidth / 2 - 5;
        this._paintButton(canvas, editButtonXPos, buttonYPos, buttonWidth, size, strokeColor, strokeColor, radius);

        canvas.save();

        canvas.setFillColor(fontColor);
        canvas.setStrokeColor(strokeColor);

        const symbolSize = size * .675;
        const svgCanvas: SvgCanvas2D = canvas as SvgCanvas2D;
        svgCanvas.node = svgCanvas.createElement("g", "");

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

    private _paintDeleteutton(height: number, canvas: AbstractCanvas2D, x: number, width: number, y: number,
                              state: CellState, style: CellStateStyle, radius: number, size: number,
                              buttonWidth: number, buttonYPos: number)
    {
        const fontColor: ColorValue = (style as OrgChartMaxGraphThemeCellStateStyle).textOnActionColor ?? "#FFFFFF";
        const strokeColor: ColorValue =
            ((style as OrgChartMaxGraphThemeCellStateStyle).actionColor ?? style.strokeColor) as ColorValue;

        const deleteButtonXPos = x + width - buttonWidth / 2 - 10 - size;
        this._paintButton(canvas, deleteButtonXPos, buttonYPos, buttonWidth, size, strokeColor, strokeColor, radius);

        canvas.save();

        canvas.setFillColor(fontColor);
        canvas.setStrokeColor(strokeColor);

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

        svgCanvas.fillAndStroke();

        canvas.restore();
    }
}

export {ModifyButtonsOverlayDecorator};