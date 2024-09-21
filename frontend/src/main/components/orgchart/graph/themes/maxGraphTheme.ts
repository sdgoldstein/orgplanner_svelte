import type {CellStateStyle} from "@maxgraph/core";

interface MaxGraphTheme
{
    getStyleForNodeType(nodeType: string): CellStateStyle;
    getStyleForEdgeType(edgeType: string): CellStateStyle;
    getEdgeStyleForLeafNode(): string
}

export type {MaxGraphTheme};
