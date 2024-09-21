import type {GuardedMap} from "@kameleon/tscore/jscore";
import {CellRenderer, type CellStateStyle, constants, Perimeter, StyleRegistry} from "@maxgraph/core";
import {type OrgEntityColorTheme, OrgEntityTypes} from "orgplanner-common/model";

import type {MaxGraphTheme} from "./maxGraphTheme";
import {OrgChartLeafEdgeStyle} from "./orgChartLeafEdgeStyle";
import {PartialFillNodeShape} from "./partialFillNodeShape";

type CellStateStyleExtension = {
    cellHeaderFontColor?: string;
}

type OrgChartMaxGraphThemeCellStateStyle = CellStateStyle&CellStateStyleExtension;

class OrgChartMaxGraphTheme implements MaxGraphTheme
{
    private static readonly leafEdgeStyle = "OrgChartLeafEdgeStyle";
    private static readonly DEFAULT_CELL_STYLE = {} as OrgChartMaxGraphThemeCellStateStyle;
    private static readonly DEFAULT_EDGE_STYLE = {} as CellStateStyle;

    private readonly nodeTypeToStyleMap: GuardedMap<string, CellStateStyle> = new Map<string, CellStateStyle>();
    private readonly edgeTypeToStyleMap: GuardedMap<string, CellStateStyle> = new Map<string, CellStateStyle>();
    private colorTheme: OrgEntityColorTheme;

    static
    {
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.perimeter = Perimeter.RectanglePerimeter;
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.rounded = true;
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.fillColor = "#ffffff";
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.arcSize = 5;
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.autoSize = true;
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.strokeWidth = 2;
        // defaultCellStyle.strokeColor = '#CFD7F2';
        // defaultCellStyle.strokeColor = '#BD0F15';
        // defaultCellStyle.fontColor = '#424c55';
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.fontColor = "black";
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.cellHeaderFontColor = "white";
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.fontSize = 12;
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.fontFamily =
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji";
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.spacing = 5;
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.align = constants.ALIGN.CENTER;
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.verticalAlign = constants.ALIGN.MIDDLE;
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.foldable = true;
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.shape = "partialFillNodeShape";
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.rotatable = false;
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.resizable = false;
        OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE.deletable = true;

        // Allow the node shape to augment the style where necessary
        PartialFillNodeShape.configureStyle(OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE);

        OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.rounded = false;
        // OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.loopStyle = chartEdgeStyleFun;
        OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.edgeStyle = constants.EDGESTYLE.TOPTOBOTTOM;
        OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.strokeColor = "#424c55";
        OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.strokeWidth = 1.5;
        OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.align = constants.ALIGN.CENTER;
        OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.verticalAlign = constants.ALIGN.MIDDLE;
        OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.exitX = 0.5;
        OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.exitY = 1.0;
        OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.entryX = 0.5;
        OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.entryY = 0;
        OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.resizable = false;
        OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.movable = false;
        OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.rotatable = false;
        OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE.deletable = true; // Need this to be able to delete with org entities
        // DEFAULT_EDGE_STYLE[mxClient.mxConstants.STYLE_STROKECOLOR] = '#6482B9';
        // DEFAULT_EDGE_STYLE[mxClient.mxConstants.STYLE_ENDARROW] = mxClient.mxConstants.ARROW_OVAL;

        // DEFAULT_EDGE_STYLE[mxClient.mxConstants.STYLE_FONTSIZE] = '10';
        // DEFAULT_EDGE_STYLE[mxClient.mxConstants.STYLE_SHAPE] = mxClient.mxConstants.SHAPE_CONNECTOR;
        // DEFAULT_EDGE_STYLE[mxClient.mxConstants.STYLE_EDGE] = mxClient.mxConstants.EDGESTYLE_SEGMENT;
        // DEFAULT_EDGE_STYLE[mxClient.mxConstants.STYLE_ROUNDED] = 1;

        //@ts-expect-error - constructor madness in the Shape hierachy.
        CellRenderer.registerShape("partialFillNodeShape", PartialFillNodeShape);

        // Put edge style in registry
        StyleRegistry.putValue(OrgChartMaxGraphTheme.leafEdgeStyle, OrgChartLeafEdgeStyle.orgChartLeafEdgeStyleFun)
    }

    constructor(colorTheme: OrgEntityColorTheme)
    {
        this.colorTheme = colorTheme;

        const managerStyle = Object.assign({}, OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE);
        managerStyle.strokeColor = this.colorTheme.getColorAssignment(OrgEntityTypes.MANAGER).primary;
        this.nodeTypeToStyleMap.set("manager", managerStyle)

        const icStyle = Object.assign({}, OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE);
        icStyle.strokeColor =
            this.colorTheme.getColorAssignment(OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR).primary; // #f2efcf
        this.nodeTypeToStyleMap.set("ic", icStyle)

        const teamStyle = Object.assign({}, OrgChartMaxGraphTheme.DEFAULT_CELL_STYLE);
        teamStyle.strokeColor = this.colorTheme.getColorAssignment(OrgEntityTypes.TEAM).primary;
        this.nodeTypeToStyleMap.set("team", teamStyle)

        const defaultEdgeStyle = Object.assign({}, OrgChartMaxGraphTheme.DEFAULT_EDGE_STYLE);
        this.edgeTypeToStyleMap.set("default", defaultEdgeStyle);
    }

    getStyleForNodeType(nodeType: string): CellStateStyle
    {
        if (!this.nodeTypeToStyleMap.has(nodeType))
        {
            throw Error("Unknown node type: " + nodeType);
        }

        return this.nodeTypeToStyleMap.get(nodeType);
    }

    getStyleForEdgeType(edgeType: string): CellStateStyle
    {
        if (!this.edgeTypeToStyleMap.has(edgeType))
        {
            throw Error("Unknown edge type: " + edgeType);
        }

        return this.edgeTypeToStyleMap.get(edgeType);
    }

    getEdgeStyleForLeafNode(): string
    {
        return OrgChartMaxGraphTheme.leafEdgeStyle;
    }
}

export {OrgChartMaxGraphTheme as OrgChartMaxGraphThemeBase};
export type{OrgChartMaxGraphThemeCellStateStyle};
