import {AbstractCanvas2D, type CellStateStyle, constants, Rectangle, RectangleShape, TextShape} from "@maxgraph/core";

import {
    OrgPlannerChartEmployeeVertex,
    OrgPlannerChartTeamVertex,
    type OrgPlannerChartVertex
} from "../../core/orgPlannerChartModel";

import type {OrgChartMaxGraphThemeCellStateStyle} from "../orgChartMaxGraphThemeDefault";
import type {OrgChartNodeShapeDecorator} from "./orgChartNodeShapeDecorator";

class OrgChartNodeShapeBase extends RectangleShape
{
    private static readonly _DEFAULT_FONT_FAMILY =
        "Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji";
    private _baseRoundedCornerRadius: number = -1;

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
            // Set the fill color to the same color as the stroke color
            canvas.setFillColor(canvas.state.strokeColor);

            // Figure out the row height - used to determine the height of the row with the employee name
            const rowHeight = OrgChartNodeShapeBase._calculateRowHeight(this.state.style);

            const radius = this._getBaseRoundedCornerRadius(height);

            // Draw the filled area at the top of the shape.  It traces around the outline and then asks to fill
            this._paintForegroundFilledTitleBox(canvas, x, y, width, rowHeight, radius);

            // Draw the label of the node hname
            // This hard codes information about the cell into the shape.  Not ideal, but okay for our purposes
            let nodeName: string = "";
            const cellValue = this.state.cell.value as OrgPlannerChartVertex;
            if (cellValue instanceof OrgPlannerChartEmployeeVertex)
            {
                nodeName = cellValue.employee.name;
            }
            else if (cellValue instanceof OrgPlannerChartTeamVertex)
            {
                nodeName = cellValue.team.title;
            }
            this._paintForegroundTitleText(nodeName, canvas, x, y, width, rowHeight, this.state.style);

            // Paint the decorators
            for (const nextDecorator of this._decorators)
            {
                nextDecorator.paintForeground(canvas, x, y, width, height, this.state, this.style);
            }
        }
    }

    private _paintForegroundFilledTitleBox(canvas: AbstractCanvas2D, x: number, y: number, width: number,
                                           rowHeight: number, radius: number)
    {
        const endX = x + width;
        const endY = y + rowHeight;
        canvas.begin();
        canvas.moveTo(endX, endY);
        canvas.quadTo(endX, y, endX - radius, y);
        canvas.lineTo(x + radius, y);
        canvas.quadTo(x, y, x, y + radius);
        canvas.lineTo(x, endY);
        canvas.fillAndStroke();
    }

    private _paintForegroundTitleText(title: string, canvas: AbstractCanvas2D, x: number, y: number, width: number,
                                      rowHeight: number, style: CellStateStyle)
    {
        // Create the text shape for the label
        // It makes no sense to me that we need to specifiy the X,Y of the bounds to be the center of the box
        const fontFamily = style.fontFamily ? style.fontFamily : OrgChartNodeShapeBase._DEFAULT_FONT_FAMILY;
        const fontSize = style.fontSize ? style.fontSize : 0;
        const fontStyle = constants.FONT.BOLD;
        const fontColor = (style as OrgChartMaxGraphThemeCellStateStyle).cellHeaderFontColor
                              ? (style as OrgChartMaxGraphThemeCellStateStyle).cellHeaderFontColor
                              : style.fontColor;
        const labelHeight: number = OrgChartNodeShapeBase._getSizeForString("NA", fontSize, fontFamily, fontStyle);

        const nameTextShape = new TextShape(
            title, new Rectangle(x + width / 2, y + rowHeight / 2, width, labelHeight), constants.ALIGN.CENTER,
            constants.ALIGN.MIDDLE, fontColor, fontFamily, fontSize, fontStyle, style.spacing, style.spacingTop,
            style.spacingRight, style.spacingBottom, style.spacingLeft, style.horizontal, style.labelBackgroundColor,
            style.labelBorderColor, false, false, "visible", style.labelPadding, "");

        nameTextShape.ignoreStringSize = true;

        nameTextShape.paint(canvas);
    }

    protected _getBaseRoundedCornerRadius(height: number)
    {
        // Calcualte it once and cache it.  It's therefore consistent and faster
        if (this._baseRoundedCornerRadius == -1)
        {
            const f = (this.style?.arcSize ?? 0.15 * 100) / 100;
            this._baseRoundedCornerRadius = height * f;
        }

        return this._baseRoundedCornerRadius;
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

    private static _getSizeForString(text: string, fontSize: number, fontFamily: string, fontStyle: number): number
    {
        const div = document.createElement("div");

        // Sets the font size and family
        div.style.fontFamily = fontFamily;
        div.style.fontSize = `${Math.round(fontSize)}px`;
        div.style.lineHeight = `${Math.round(fontSize * constants.LINE_HEIGHT)}px`;

        // Disables block layout and outside wrapping and hides the div
        div.style.position = "absolute";
        div.style.visibility = "hidden";
        div.style.display = "inline-block";
        div.style.whiteSpace = "nowrap";

        // Adds the text and inserts into DOM for updating of size
        div.innerHTML = text;
        document.body.appendChild(div);

        // Gets the size and removes from DOM
        const height = div.offsetHeight
        document.body.removeChild(div);

        return height;
    }

    static _configureStyle(styleToConfigure: CellStateStyle): void
    {
        const rowHeight = OrgChartNodeShapeBase._calculateRowHeight(styleToConfigure);
        styleToConfigure.spacingTop = rowHeight;
    }

    private static _calculateRowHeight(style: CellStateStyle): number
    {
        const fontFamily = style.fontFamily ? style.fontFamily : "Arial"; // FIXME - Arial?
        const fontSize = style.fontSize ? style.fontSize : 0;
        const fontStyle = style.fontStyle ? style.fontStyle : 0;
        const labelHeight: number = OrgChartNodeShapeBase._getSizeForString("NA", fontSize, fontFamily, fontStyle);

        return labelHeight + 6; // Adding a buffer to the height
    }
}

export {OrgChartNodeShapeBase};
