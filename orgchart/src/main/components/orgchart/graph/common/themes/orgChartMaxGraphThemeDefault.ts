import {type CellStateStyle, constants, Perimeter, StyleRegistry} from "@maxgraph/core";
import {type OrgEntityColorTheme, OrgEntityTypes} from "orgplanner-common/model";

import type {MaxGraphTheme} from "./maxGraphTheme";
import {OrgChartLeafEdgeStyle} from "./orgChartLeafEdgeStyle";
import {OrgChartNodeShapeDefault} from "./shape/orgChartNodeShapeDefault";

type CellStateStyleExtension = {
    cellHeaderFontColor?: string;
    actionColor?: string;
    textOnActionColor?: string;
}

type OrgChartMaxGraphThemeCellStateStyle = CellStateStyle&CellStateStyleExtension;

class OrgChartMaxGraphThemeDefault implements MaxGraphTheme
{
    private static readonly leafEdgeStyle = "OrgChartLeafEdgeStyle";
    private static readonly DEFAULT_CELL_STYLE = {} as OrgChartMaxGraphThemeCellStateStyle;
    private static readonly DEFAULT_EDGE_STYLE = {} as CellStateStyle;

    private readonly nodeTypeToStyleMap: Map<string, CellStateStyle> = new Map<string, CellStateStyle>();
    private readonly edgeTypeToStyleMap: Map<string, CellStateStyle> = new Map<string, CellStateStyle>();
    private colorTheme: OrgEntityColorTheme;

    static
    {
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.perimeter = Perimeter.RectanglePerimeter;
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.rounded = true;
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.fillColor = "#ffffff";
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.arcSize = 10;
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.absoluteArcSize = true;

        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.autoSize = true;
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.strokeWidth = 2;
        // defaultCellStyle.strokeColor = '#CFD7F2';
        // defaultCellStyle.strokeColor = '#BD0F15';
        // defaultCellStyle.fontColor = '#424c55';
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.fontColor = "black";
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.cellHeaderFontColor = "white";
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.fontSize = 12;
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.fontFamily =
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji";
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.spacing = 5;
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.align = constants.ALIGN.CENTER;
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.verticalAlign = constants.ALIGN.MIDDLE;
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.foldable = true;
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.rotatable = false;
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.resizable = false;
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.deletable = true;

        // Allow the node shape to augment the style where necessary
        OrgChartNodeShapeDefault._configureStyle(OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE);

        OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE.rounded = false;
        // OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.loopStyle = chartEdgeStyleFun;
        OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE.edgeStyle = constants.EDGESTYLE.TOPTOBOTTOM;
        OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE.strokeColor = "#424c55";
        OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE.strokeWidth = 1.5;
        OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE.align = constants.ALIGN.CENTER;
        OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE.verticalAlign = constants.ALIGN.MIDDLE;
        OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE.exitX = 0.5;
        OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE.exitY = 1.0;
        OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE.entryX = 0.5;
        OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE.entryY = 0;
        OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE.resizable = false;
        OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE.movable = false;
        OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE.rotatable = false;
        OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE.deletable =
            true; // Need this to be able to delete with org entities
        // DEFAULT_EDGE_STYLE[mxClient.mxConstants.STYLE_STROKECOLOR] = '#6482B9';
        // DEFAULT_EDGE_STYLE[mxClient.mxConstants.STYLE_ENDARROW] = mxClient.mxConstants.ARROW_OVAL;

        // DEFAULT_EDGE_STYLE[mxClient.mxConstants.STYLE_FONTSIZE] = '10';
        // DEFAULT_EDGE_STYLE[mxClient.mxConstants.STYLE_SHAPE] = mxClient.mxConstants.SHAPE_CONNECTOR;
        // DEFAULT_EDGE_STYLE[mxClient.mxConstants.STYLE_EDGE] = mxClient.mxConstants.EDGESTYLE_SEGMENT;
        // DEFAULT_EDGE_STYLE[mxClient.mxConstants.STYLE_ROUNDED] = 1;

        // Put edge style in registry
        StyleRegistry.putValue(OrgChartMaxGraphThemeDefault.leafEdgeStyle,
                               OrgChartLeafEdgeStyle.orgChartLeafEdgeStyleFun)
    }

    constructor(colorTheme: OrgEntityColorTheme)
    {
        this.colorTheme = colorTheme;

        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.actionColor = colorTheme.accentColor.primary;
        OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE.textOnActionColor = colorTheme.accentColor.textOnPrimary;

        const managerStyle = Object.assign({}, OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE);
        managerStyle.strokeColor = this.colorTheme.getColorAssignment(OrgEntityTypes.MANAGER).primary;
        this.nodeTypeToStyleMap.set("manager", managerStyle)

        const icStyle = Object.assign({}, OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE);
        icStyle.strokeColor =
            this.colorTheme.getColorAssignment(OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR).primary; // #f2efcf
        this.nodeTypeToStyleMap.set("ic", icStyle)

        const teamStyle = Object.assign({}, OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE);
        const teamEntity = this.colorTheme.getColorAssignment(OrgEntityTypes.TEAM);
        const teamColor = teamEntity.primary;
        teamStyle.strokeColor = teamColor;
        teamStyle.fillColor = teamColor;
        teamStyle.fontColor = teamEntity.textOnPrimary;
        teamStyle.fontStyle = constants.FONT.BOLD;
        teamStyle.spacingTop =
            0; // FIXME - This is set by the
               // OrgChartNodeShapeDefault._configureStyle(OrgChartMaxGraphThemeDefault.DEFAULT_CELL_STYLE);
               // above.  It shouldn't be, since we're now using different node shapes!
        this.nodeTypeToStyleMap.set("team", teamStyle)

        const defaultEdgeStyle = Object.assign({}, OrgChartMaxGraphThemeDefault.DEFAULT_EDGE_STYLE);
        this.edgeTypeToStyleMap.set("default", defaultEdgeStyle);
    }

    getStyleForNodeType(nodeType: string): CellStateStyle
    {
        const valueToReturn = this.nodeTypeToStyleMap.get(nodeType);
        if (valueToReturn === undefined)
        {
            throw Error("Unknown node type: " + nodeType);
        }

        return valueToReturn;
    }

    getStyleForEdgeType(edgeType: string): CellStateStyle
    {
        const valueToReturn = this.edgeTypeToStyleMap.get(edgeType);
        if (valueToReturn === undefined)
        {
            throw Error("Unknown edge type: " + edgeType);
        }

        return valueToReturn;
    }

    getEdgeStyleForLeafNode(): string
    {
        return OrgChartMaxGraphThemeDefault.leafEdgeStyle;
    }
}

export {OrgChartMaxGraphThemeDefault};
export type{OrgChartMaxGraphThemeCellStateStyle};
