import {AbstractCanvas2D, type CellStateStyle, constants, Rectangle} from "@maxgraph/core";

import {DecoratedRectangleMaxGraphShape} from "./decoratedRectangleMaxGraphShape";
import type {L} from "vitest/dist/chunks/reporters.D7Jzd9GS.js";

class OrgChartNodeSelectionShapeBase extends DecoratedRectangleMaxGraphShape
{
    private _baseRoundedCornerRadius: number = -1;

    constructor(bounds: Rectangle, fill: string, stroke: string, strokewidth: number|undefined,
                private _style: CellStateStyle)
    {
        // At runtime, these parameters are all undefined!  Seemed like a bug in the library
        super(bounds, fill, stroke, strokewidth);
    }

    paintBackground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number): void
    {
        canvas.save();

        // Set the fill color to the same color as the stroke color
        canvas.setStrokeColor(this._style.strokeColor as string);
        canvas.setStrokeWidth(this.strokeWidth);

        const radius = 0 // this._getBaseRoundedCornerRadius(width, height, this._style);
        const gap = 4;
        const lineLength = 7

        const endX = x + width + gap;
        const endY = y + height + gap;
        const startX = x - gap;
        const startY = y - gap;

        canvas.begin();
        // Top Left Corner
        canvas.moveTo(startX, startY + radius + lineLength);
        canvas.lineTo(startX, startY + radius);
        canvas.quadTo(startX, startY, startX + radius, startY);
        canvas.lineTo(startX + radius + lineLength, startY);

        // Top Line
        canvas.moveTo(startX + width / 2 + gap - lineLength, startY);
        canvas.lineTo(startX + width / 2 + gap + lineLength, startY);

        // Top Right Corner
        canvas.moveTo(endX - radius - lineLength, startY);
        canvas.lineTo(endX - radius, startY);
        canvas.quadTo(endX, startY, endX, startY + radius);
        canvas.lineTo(endX, startY + radius + lineLength);

        // Right Line
        // canvas.moveTo(endX, startY + height / 2 + gap - lineLength);
        // canvas.lineTo(endX, startY + height / 2 + gap + lineLength);

        // Bottom Right Corner
        canvas.moveTo(endX, endY - radius - lineLength);
        canvas.lineTo(endX, endY - radius);
        canvas.quadTo(endX, endY, endX - radius, endY);
        canvas.lineTo(endX - radius - lineLength, endY);

        // Botton Line
        canvas.moveTo(startX + width / 2 + gap - lineLength, endY);
        canvas.lineTo(startX + width / 2 + gap + lineLength, endY);

        // Bottom Left Corner
        canvas.moveTo(startX + radius + lineLength, endY);
        canvas.lineTo(startX + radius, endY);
        canvas.quadTo(startX, endY, startX, endY - radius);
        canvas.lineTo(startX, endY - radius - lineLength);

        // Left Line
        // canvas.moveTo(startX, startY + height / 2 + gap - lineLength);
        // canvas.lineTo(startX, startY + height / 2 + gap + lineLength);

        canvas.fillAndStroke();

        canvas.restore();
    }

    protected _getBaseRoundedCornerRadius(width: number, height: number, style: CellStateStyle)
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

export {OrgChartNodeSelectionShapeBase};
