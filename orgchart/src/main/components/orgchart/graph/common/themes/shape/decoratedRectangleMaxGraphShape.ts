import {AbstractCanvas2D, Rectangle, RectangleShape} from "@maxgraph/core";

import type {OrgChartNodeShapeDecorator} from "./orgChartNodeShapeDecorator";

class DecoratedRectangleMaxGraphShape extends RectangleShape
{
    private _decorators = new Array<OrgChartNodeShapeDecorator>();

    constructor(bounds: Rectangle, fill: string, stroke: string, strokewidth: number|undefined)
    {
        // At runtime, these parameters are all undefined!  Seemed like a bug in the library
        super(bounds, fill, stroke, strokewidth);
    }

    protected registerDecorator(decorator: OrgChartNodeShapeDecorator): void
    {
        this._decorators.push(decorator);
    }

    paintForeground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number): void
    {
        super.paintForeground(canvas, x, y, width, height);

        /* Fill in the top of the cell with the persons name.  Fill with color */

        // state is optional - why?!
        if ((this.state) && (this.style))
        {
            // Paint the decorators
            for (const nextDecorator of this._decorators)
            {
                nextDecorator.paintForeground(canvas, x, y, width, height, this.state, this.style);
            }
        }
    }

    paintBackground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number): void
    {
        super.paintBackground(canvas, x, y, width, height);

        // state is optional - why?!
        if ((this.state) && (this.style))
        {
            // Paint the decorators
            for (const nextDecorator of this._decorators)
            {
                nextDecorator.paintBackground(canvas, x, y, width, height, this.state, this.style);
            }
        }
    }
}

export {DecoratedRectangleMaxGraphShape};
