import {CellState, Geometry, GraphView, Point} from "@maxgraph/core";

class OrgChartLeafEdgeStyle
{
    static orgChartLeafEdgeStyleFun(state: CellState, source: CellState, target: CellState, points: Point[],
                                    result: Point[])
    {
        const view: GraphView = state.view
        if ((source != null) && (target != null))
        {

            const geometry: Geometry|null = state.cell.geometry;
            if (!geometry)
            {
                throw new Error("Edge geometry is null");
            }

            const leftEdgeX = target.x - 10;

            const controlPoints = geometry.points;
            if ((!controlPoints) || (controlPoints.length == 0))
            {
                // If there are no control points, then the leafs are the only children.  In that case, we offset the
                // exit point of the parent and go straight down with the edge state.style.exitDx = leftEdgeX -
                // view.getRoutingCenterX(source); // FIXME
            }
            else
            {
                // Add point 1
                const startY = source.y + source.height;
                const controlPointY = controlPoints[0];
                const transformedControlPoint = view.transformControlPoint(state, controlPointY);
                if (transformedControlPoint == null)
                {
                    // Could this ever happen?
                    throw new Error("Transformed control point is null.");
                }
                const y = Math.round(startY + (transformedControlPoint.y - startY) / 2);
                const x = view.getRoutingCenterX(source);

                result.push(new Point(x, y));

                // Add point two  - FIXME - Hard Coding 5
                result.push(new Point(leftEdgeX, y));
            }

            // Add last point
            const y = view.getRoutingCenterY(target);
            result.push(new Point(leftEdgeX, y));

            // set entry coordinates
            // state.style.entryX = 0;
            // state.style.entryY = 0.5;
        }
    }
}

export {OrgChartLeafEdgeStyle};