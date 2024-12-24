/**
 * Based on the Reingold-Tilford Algorithm
 * https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/
 * http://llimllib.github.io/pymag-trees/#foot1
 */

import {Cell, Graph, GraphLayout, Rectangle} from "@maxgraph/core";

import {AttachToGridStep} from "./attachToGridStep";
import {DefaultLayoutConfiguration, type LayoutConfiguration} from "./layoutConfiguration";
import type {NodeLayoutMetadata} from "./nodeLayoutMetadata";
import {NodeLayoutMetadataCreationStep} from "./nodeLayoutMetadataCreationStep";
import {NodePreLayoutStep} from "./nodePreLayoutStep";

class OrgPlannerChartLayout extends GraphLayout
{
    private readonly _layoutConfiguration: LayoutConfiguration;

    private readonly _leafEdgeLeftOffset =
        10; // FIXME - Put this in configuration?  It's part of the edge style, not the layout config

    /**
     * Create an OrgPlanerChartLayout
     *
     * @param graph The graph to layout
     */
    constructor(graph: Graph, private _rootCellCallback: () => Cell | null)
    {
        super(graph);
        this._layoutConfiguration = new DefaultLayoutConfiguration();
    }

    get layoutConfiguration(): LayoutConfiguration
    {
        return this._layoutConfiguration;
    }

    execute(parent: Cell): void
    {
        console.trace("Laying out Tree");

        // FIXME - This is a hack to get the root cell.  Is there a better way?
        // Should create a "TreeGraph interface that as a getRootCell method"
        const root: Cell|null = this._rootCellCallback();

        if (root)
        {
            console.trace(`Starting with root node: ${root.value}`);

            // Create a graph node metadata structure
            console.trace(`Building Node metadata graph`);

            const rootNodeMetadata: NodeLayoutMetadata =
                new NodeLayoutMetadataCreationStep(this).createNodeMetadata(root);

            // layout the cells relative to each other
            console.trace(`Laying out metadata graph`);

            new NodePreLayoutStep(this).doPreLayout(rootNodeMetadata);

            // Now attach the layout to the current grid container
            console.trace(`Attaching layout to grid`);

            new AttachToGridStep(this).attachLayoutToGrid(rootNodeMetadata);
        }

        // Center
        // Not that even if there are no roots, there may be one cell in the tree.  So, we run cetnering logic
        console.trace(`Centering in viewport`);

        const allCells = this.graph.getChildCells(this.graph.getDefaultParent(), true, true);
        const graphBounds = this.graph.getBoundingBoxFromGeometry(allCells, true);
        const containerWidth = this.graph.container.clientWidth;

        if ((graphBounds) && (graphBounds.width < containerWidth))
        {
            const translateX: number = (containerWidth - graphBounds.width) / 2;

            console.trace(`Translating graph, [${translateX}, 0)]`);

            this.graph.view.setTranslate(translateX, 0);
        }
    }

    public get leafEdgeLeftOffset(): number
    {
        return this._leafEdgeLeftOffset;
    }

    getVertexBounds(cell: Cell): Rectangle
    {
        const boundsToReturn = super.getVertexBounds(cell);
        if (boundsToReturn.width < this.layoutConfiguration.minCellWidth)
        {
            boundsToReturn.width = this.layoutConfiguration.minCellWidth;
        }
        return boundsToReturn;
    }
}

export {OrgPlannerChartLayout};
