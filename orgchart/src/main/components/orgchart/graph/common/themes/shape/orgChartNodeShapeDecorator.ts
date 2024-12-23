import type {AbstractCanvas2D, CellState, CellStateStyle} from "@maxgraph/core";

interface OrgChartNodeShapeDecorator
{
    paintBackground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number, state: CellState,
                    style: CellStateStyle): void;
    paintForeground(canvas: AbstractCanvas2D, x: number, y: number, width: number, height: number, state: CellState,
                    style: CellStateStyle): void
}

export type{OrgChartNodeShapeDecorator};