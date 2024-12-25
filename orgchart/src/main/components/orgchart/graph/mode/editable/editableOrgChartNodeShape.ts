import type {Rectangle} from "@maxgraph/core";
import {OrgChartNodeShapeBase} from "../../common/themes/shape/orgChartNodeShapeBase";
import {ToggleSubtreeOveralyShapeDecorator} from "../../common/themes/shape/toggleSubtreeOverlayShapeDecorator";
import {NoLabelOrgChartShape} from "../../common/themes/shape/noLabelOrgChartShape";
import {ModifyButtonsOverlayDecorator} from "../../common/themes/shape/modifyButtonsOverlayDecorator";

class EditableOrgChartNodeShape extends OrgChartNodeShapeBase
{
    constructor(bounds: Rectangle, fill: string, stroke: string, strokewidth: number|undefined)
    {
        // At runtime, these parameters are all undefined!  Seemed like a bug in the library
        super(bounds, fill, stroke, strokewidth);

        this.registerDecorator(new ToggleSubtreeOveralyShapeDecorator());
        this.registerDecorator(new ModifyButtonsOverlayDecorator());
    }
}

class EditableNoLabelOrgChartShape extends NoLabelOrgChartShape
{
    constructor(bounds: Rectangle, fill: string, stroke: string, strokewidth: number|undefined)
    {
        // At runtime, these parameters are all undefined!  Seemed like a bug in the library
        super(bounds, fill, stroke, strokewidth);

        this.registerDecorator(new ToggleSubtreeOveralyShapeDecorator());
        this.registerDecorator(new ModifyButtonsOverlayDecorator());
    }
}
export {EditableOrgChartNodeShape, EditableNoLabelOrgChartShape};