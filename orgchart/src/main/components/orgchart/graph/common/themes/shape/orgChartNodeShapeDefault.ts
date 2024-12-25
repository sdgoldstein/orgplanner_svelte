import {AbstractCanvas2D, Rectangle, SvgCanvas2D} from "@maxgraph/core";

import {ModifyButtonsOverlayDecorator} from "./modifyButtonsOverlayDecorator";
import {OrgChartNodeShapeBase} from "./orgChartNodeShapeBase";
import {ToggleSubtreeOveralyShapeDecorator} from "./toggleSubtreeOverlayShapeDecorator";

// FIXME - turn these into Decorators
class OrgChartNodeShapeDefault extends OrgChartNodeShapeBase
{
    constructor(bounds: Rectangle, fill: string, stroke: string, strokewidth: number|undefined)
    {
        // At runtime, these parameters are all undefined!  Seemed like a bug in the library
        super(bounds, fill, stroke, strokewidth);

        this.registerDecorator(new ToggleSubtreeOveralyShapeDecorator());
        this.registerDecorator(new ModifyButtonsOverlayDecorator());
    }
}

export {OrgChartNodeShapeDefault};
