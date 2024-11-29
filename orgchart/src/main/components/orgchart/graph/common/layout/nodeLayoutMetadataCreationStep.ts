import {Cell} from "@maxgraph/core";

import type {OrgPlannerChartModel} from "../core/orgPlannerChartModel";

import {DefaultNodeLayoutMetadata, LeafWrapperNodeMetadata, type NodeLayoutMetadata} from "./nodeLayoutMetadata";
import {OrgPlannerChartLayout} from "./orgPlannerChartLayout";

class NodeLayoutMetadataCreationStep
{
    private readonly _layout: OrgPlannerChartLayout;

    constructor(layout: OrgPlannerChartLayout)
    {
        this._layout = layout;
    }

    private get layout(): OrgPlannerChartLayout
    {
        return this._layout;
    }

    createNodeMetadata(cell: Cell): NodeLayoutMetadata
    {
        console.trace(`Creating node metadata for : ${cell.value}`);

        const nodeMetadata: NodeLayoutMetadata = new DefaultNodeLayoutMetadata(cell, this.layout.getVertexBounds(cell));

        this.traverseEdges(this.layout, nodeMetadata);

        return nodeMetadata;
    }

    private traverseEdges(layout: OrgPlannerChartLayout, nodeMetadata: NodeLayoutMetadata)
    {
        const model: OrgPlannerChartModel = layout.graph.model as OrgPlannerChartModel;

        let leafNodeMetadata = null;

        const cell: Cell = nodeMetadata.cell;
        const outgoingEdges = layout.graph.getEdges(cell, null, false, true, false, false);
        for (const nextEdge of outgoingEdges)
        {
            const nextChild = nextEdge.getTerminal(false);
            if ((nextChild) && (!layout.isVertexIgnored(nextChild)) && (model.isVisible(nextChild)))
            {
                console.trace(`Creating node metadata for child: ${nextChild.value}`);

                const nextChildNodeMetadata = this.createNodeMetadata(nextChild);

                if (this.isLeafNode(nextChildNodeMetadata))
                {
                    console.trace(`Child, ${nextChild.value}, is a leaf node`);

                    if (leafNodeMetadata == null)
                    {
                        console.trace(`Creating Leaf Node Meta Data for ${cell.value}`);

                        // FIXME - Is this right?  Why do we put the nextChild as the cell of the leadnode?  What other
                        // cell would we use?
                        leafNodeMetadata = new LeafWrapperNodeMetadata(nextChild, layout.getVertexBounds(nextChild),
                                                                       layout.layoutConfiguration.verticalSpacing);
                        nodeMetadata.prependChildNode(leafNodeMetadata);
                    }

                    console.trace(`Adding child, ${nextChild.value}, as leaf to, ${cell.value}`);

                    leafNodeMetadata.addChildNode(nextChildNodeMetadata);
                }

                else
                {
                    console.trace(`Adding child, ${nextChild.value}, to, ${cell.value}`);

                    // Add child node
                    nodeMetadata.addChildNode(nextChildNodeMetadata);
                }
            }

            else
            {
                console.trace(`Found hidden child to ${cell.value}`);

                nodeMetadata.hasHiddenChildren = true;
            }
        }
    }

    private isLeafNode(nextChildNodeMetadata: NodeLayoutMetadata)
    {
        const model: OrgPlannerChartModel = this.layout.graph.model as OrgPlannerChartModel;
        return ((model.isLeafNode(nextChildNodeMetadata.cell)) && (nextChildNodeMetadata.childNodes.length == 0) &&
                (!nextChildNodeMetadata.hasHiddenChildren));
    }
}

export {NodeLayoutMetadataCreationStep};