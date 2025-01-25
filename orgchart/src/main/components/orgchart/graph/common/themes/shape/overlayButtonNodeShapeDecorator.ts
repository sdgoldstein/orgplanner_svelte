import {AbstractCanvas2D, CellState, type CellStateStyle, type ColorValue, constants} from "@maxgraph/core";
import type {OrgChartNodeShapeDecorator} from "./orgChartNodeShapeDecorator";

abstract class OverlayButtonNodeShapeDecorator implements OrgChartNodeShapeDecorator
{
    private _baseRoundedCornerRadius: number = -1;

    abstract paintBackground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number,
                             state: CellState, style: CellStateStyle): void;

    paintForeground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number, state: CellState,
                    style: CellStateStyle): void
    {
    }

    protected _paintButton(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number,
                           strokeColor: ColorValue, fillColor: ColorValue, radius: number)
    {
        canvas.save();

        canvas.setStrokeColor(strokeColor);
        canvas.setFillColor(fillColor);

        canvas.setStrokeWidth(1);
        canvas.setStrokeAlpha(0.5);
        canvas.roundrect(x - width / 2, y - height / 2, width, height, radius, radius);
        canvas.fillAndStroke();

        canvas.restore();
    }

    protected _getBaseRoundedCornerRadius(width: number, height: number, style: CellStateStyle): number
    {
        // Calcualte it once and cache it.  It's therefore consistent and faster
        if (this._baseRoundedCornerRadius == -1)
        {
            this._baseRoundedCornerRadius =
                Math.min(width / 2, Math.min(height / 2, (style.arcSize ?? constants.LINE_ARCSIZE) / 2));
        }

        return this._baseRoundedCornerRadius;
    }
}

export {OverlayButtonNodeShapeDecorator};