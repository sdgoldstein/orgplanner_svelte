import {AbstractCanvas2D, type CellStateStyle, constants, Rectangle, RectangleShape, TextShape} from "@maxgraph/core";

import {
    OrgPlannerChartEmployeeVertex,
    OrgPlannerChartTeamVertex,
    type OrgPlannerChartVertex
} from "../orgPlannerChartModel";

import type {OrgChartMaxGraphThemeCellStateStyle} from "./orgChartMaxGraphThemeBase";

class PartialFillNodeShape extends RectangleShape
{
    constructor(bounds: Rectangle, fill: string, stroke: string, strokewidth: number|undefined)
    {
        super(bounds, fill, stroke, strokewidth);
    }

    paintForeground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number): void
    {
        super.paintForeground(canvas, x, y, width, height);

        // state is optional - why?!
        if (this.state)
        {
            const rowHeight = PartialFillNodeShape.calculateRowHeight(this.state.style);

            // Set to the same color as the stroke color
            canvas.setFillColor(canvas.state.strokeColor);

            // This is based on the code found in the super class for paint background
            if (this.isRounded)
            {
                let radius = 0;

                if (this.style?.absoluteArcSize ?? false)
                {
                    // 20 is copied from Constants, since I couldn't import it
                    radius = Math.min(width / 2, Math.min(height / 2, (this.style?.arcSize ?? 20) / 2));
                }
                else
                {
                    // .15 is copied from Constants, since I couldn't import it
                    const f = (this.style?.arcSize ?? 0.15 * 100) / 100;
                    radius = Math.min(width * f, height * f);
                }

                // Draw the filled area at the top of the shape.  It traces around the outline and then asks to fill it
                canvas.begin();
                canvas.moveTo(x + width, y + rowHeight);
                canvas.lineTo(x + width, y + radius);
                canvas.quadTo(x + width, y, x + width - radius, y);
                canvas.lineTo(x + radius, y);
                canvas.quadTo(x, y, x, y + radius);
                canvas.lineTo(x, y + rowHeight);
            }
            else
            {
                canvas.rect(x, y, width, rowHeight);
            }

            canvas.fillAndStroke();

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

            // Create the text shape for the label
            // It makes no sense to me that we need to specifiy the X,Y of the bounds to be the center of the box
            const fontFamily = this.state.style.fontFamily ? this.state.style.fontFamily : 'Arial'; // FIXME - Arial?
            const fontSize = this.state.style.fontSize ? this.state.style.fontSize : 0;
            const fontStyle = constants.FONT.BOLD;
            const fontColor = (this.state.style as OrgChartMaxGraphThemeCellStateStyle).cellHeaderFontColor
                                  ? (this.state.style as OrgChartMaxGraphThemeCellStateStyle).cellHeaderFontColor
                                  : this.state.style.fontColor;
            const labelHeight: number = PartialFillNodeShape.getSizeForString("NA", fontSize, fontFamily, fontStyle);
            const nameTextShape = new TextShape(
                nodeName, new Rectangle(x + width / 2, y + rowHeight / 2, width, labelHeight), constants.ALIGN.CENTER,
                this.state.getVerticalAlign(), fontColor, fontFamily, fontSize, fontStyle, this.state.style.spacing,
                this.state.style.spacingTop, this.state.style.spacingRight, this.state.style.spacingBottom,
                this.state.style.spacingLeft, this.state.style.horizontal, this.state.style.labelBackgroundColor,
                this.state.style.labelBorderColor, false, false, 'visible', this.state.style.labelPadding, '');
            nameTextShape.ignoreStringSize = true;

            nameTextShape.paint(canvas);
        }
    }

    static getSizeForString(text: string, fontSize: number, fontFamily: string, fontStyle: number): number
    {
        const div = document.createElement('div');

        // Sets the font size and family
        div.style.fontFamily = fontFamily;
        div.style.fontSize = `${Math.round(fontSize)}px`;
        div.style.lineHeight = `${Math.round(fontSize * constants.LINE_HEIGHT)}px`;

        // Sets the font style - ignore for now
        /*if (fontStyle !== null)
        {
          matchBinaryMask(fontStyle, FONT.BOLD) && (div.style.fontWeight = 'bold');
          matchBinaryMask(fontStyle, FONT.ITALIC) && (div.style.fontWeight = 'italic');

          const txtDecor = [];
          matchBinaryMask(fontStyle, FONT.UNDERLINE) && txtDecor.push('underline');
          matchBinaryMask(fontStyle, FONT.STRIKETHROUGH) && txtDecor.push('line-through');
          txtDecor.length > 0 && (div.style.textDecoration = txtDecor.join(' '));
        }*/

        // Disables block layout and outside wrapping and hides the div
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.display = 'inline-block';
        div.style.whiteSpace = 'nowrap';

        // Adds the text and inserts into DOM for updating of size
        div.innerHTML = text;
        document.body.appendChild(div);

        // Gets the size and removes from DOM
        const height = div.offsetHeight
        document.body.removeChild(div);

        return height;
    }

    /*override getLabelBounds(rect: Rectangle): Rectangle
    {
          // state is optional - why?!
           if (this.state)
           {
                  let rowHeight = PartialFillNodeShape.calculateRowHeight(this.state.style);
                  return new Rectangle(rect.x, rect.y + rowHeight, rect.width, rect.height);
           }

          return new Rectangle(rect.x, rect.y, 0, 0);
    }*/

    static configureStyle(styleToConfigure: CellStateStyle): void
    {
        const rowHeight = PartialFillNodeShape.calculateRowHeight(styleToConfigure);
        styleToConfigure.spacingTop = rowHeight;
    }

    private static calculateRowHeight(style: CellStateStyle): number
    {
        const fontFamily = style.fontFamily ? style.fontFamily : 'Arial'; // FIXME - Arial?
        const fontSize = style.fontSize ? style.fontSize : 0;
        const fontStyle = style.fontStyle ? style.fontStyle : 0;
        const labelHeight: number = PartialFillNodeShape.getSizeForString("NA", fontSize, fontFamily, fontStyle);

        return labelHeight + 6; // Adding a buffer to the height
    }
}

export {PartialFillNodeShape};
