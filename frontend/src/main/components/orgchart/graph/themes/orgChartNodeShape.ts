import {
    AbstractCanvas2D,
    Cell,
    type CellStateStyle,
    constants,
    Rectangle,
    RectangleShape,
    SvgCanvas2D,
    TextShape
} from "@maxgraph/core";

import {
    OrgPlannerChartEmployeeVertex,
    OrgPlannerChartTeamVertex,
    type OrgPlannerChartVertex
} from "../orgPlannerChartModel";

import type {OrgChartMaxGraphThemeCellStateStyle} from "./orgChartMaxGraphThemeBase";

class OrgChartNodeShape extends RectangleShape
{
    private static readonly _DEFAULT_FONT_FAMILY =
        "Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji";
    private _baseRoundedCornerRadius: number = -1;

    editButtonBounds: Rectangle|undefined;
    deleteButtonBounds: Rectangle|undefined;

    constructor(bounds: Rectangle, fill: string, stroke: string, strokewidth: number|undefined)
    {
        // At runtime, these parameters are all undefined!  Seemed like a bug in the library
        super(bounds, fill, stroke, strokewidth);
    }

    paintForeground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number): void
    {
        super.paintForeground(canvas, x, y, width, height);

        /* Fill in the top of the cell with the persons name.  Fill with color */

        // state is optional - why?!
        if (this.state)
        {
            // Set the fill color to the same color as the stroke color
            canvas.setFillColor(canvas.state.strokeColor);

            // Figure out the row height - used to determine the height of the row with the employee name
            const rowHeight = OrgChartNodeShape._calculateRowHeight(this.state.style);

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
        const fontFamily = style.fontFamily ? style.fontFamily : OrgChartNodeShape._DEFAULT_FONT_FAMILY;
        const fontSize = style.fontSize ? style.fontSize : 0;
        const fontStyle = constants.FONT.BOLD;
        const fontColor = (style as OrgChartMaxGraphThemeCellStateStyle).cellHeaderFontColor
                              ? (style as OrgChartMaxGraphThemeCellStateStyle).cellHeaderFontColor
                              : style.fontColor;
        const labelHeight: number = OrgChartNodeShape._getSizeForString("NA", fontSize, fontFamily, fontStyle);

        const nameTextShape = new TextShape(
            title, new Rectangle(x + width / 2, y + rowHeight / 2, width, labelHeight), constants.ALIGN.CENTER,
            constants.ALIGN.MIDDLE, fontColor, fontFamily, fontSize, fontStyle, style.spacing, style.spacingTop,
            style.spacingRight, style.spacingBottom, style.spacingLeft, style.horizontal, style.labelBackgroundColor,
            style.labelBorderColor, false, false, "visible", style.labelPadding, "");

        nameTextShape.ignoreStringSize = true;

        nameTextShape.paint(canvas);
    }

    private _getBaseRoundedCornerRadius(height: number)
    {
        // Calcualte it once and cache it.  It's therefore consistent and faster
        if (this._baseRoundedCornerRadius == -1)
        {
            const f = (this.style?.arcSize ?? 0.15 * 100) / 100;
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
            const currentCellValue: OrgPlannerChartEmployeeVertex = currentCell.value as OrgPlannerChartEmployeeVertex;
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
        const rowHeight = OrgChartNodeShape._calculateRowHeight(styleToConfigure);
        styleToConfigure.spacingTop = rowHeight;
    }

    private static _calculateRowHeight(style: CellStateStyle): number
    {
        const fontFamily = style.fontFamily ? style.fontFamily : "Arial"; // FIXME - Arial?
        const fontSize = style.fontSize ? style.fontSize : 0;
        const fontStyle = style.fontStyle ? style.fontStyle : 0;
        const labelHeight: number = OrgChartNodeShape._getSizeForString("NA", fontSize, fontFamily, fontStyle);

        return labelHeight + 6; // Adding a buffer to the height
    }
}

export {OrgChartNodeShape};
