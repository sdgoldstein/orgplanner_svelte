import type {Rectangle} from "@maxgraph/core";
import {OrgChartNodeShapeBase} from "./orgChartNodeShapeBase";

class ReadOnlyOrgChartNodeShape extends OrgChartNodeShapeBase
{
    constructor(bounds: Rectangle, fill: string, stroke: string, strokewidth: number|undefined)
    {
        // At runtime, these parameters are all undefined!  Seemed like a bug in the library
        super(bounds, fill, stroke, strokewidth);
    }
}

export {ReadOnlyOrgChartNodeShape};