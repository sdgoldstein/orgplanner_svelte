import type {Rectangle} from "@maxgraph/core";
import {DecoratedRectangleMaxGraphShape} from "./decoratedRectangleMaxGraphShape";

class NoLabelOrgChartShape extends DecoratedRectangleMaxGraphShape
{
    constructor(bounds: Rectangle, fill: string, stroke: string, strokewidth: number|undefined)
    {
        // At runtime, these parameters are all undefined!  Seemed like a bug in the library
        super(bounds, fill, stroke, strokewidth);
    }
}

export {NoLabelOrgChartShape}
