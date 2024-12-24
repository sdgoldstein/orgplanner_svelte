import {Point} from "@maxgraph/core";

import type {EditableOrgChartMaxGraph} from "../../mode/editable/editbleOrgChartMaxGraph";

import {LeafWrapperNodeMetadata, type NodeLayoutMetadata} from "./nodeLayoutMetadata";
import {OrgPlannerChartLayout} from "./orgPlannerChartLayout";

class NodePreLayoutStep
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

    doPreLayout(rootNodeMetadata: NodeLayoutMetadata): void
    {
        this.layoutNode(rootNodeMetadata, [ 0, 0 ]);
    }

    private layoutNode(nodeMetadata: NodeLayoutMetadata, currentPosition: [ number, number ]): [ number, number ]
    {
        console.trace(`Layout node, ${nodeMetadata.cell.value}, at ${currentPosition[0]},${currentPosition[1]} `);

        let positionToReturn: [ number, number ] = currentPosition;

        if (nodeMetadata instanceof LeafWrapperNodeMetadata)
        {
            positionToReturn = this.layoutLeafWrapperNode(nodeMetadata, currentPosition);
        }
        else
        {
            const childNodes = nodeMetadata.childNodes;
            if (childNodes.length > 0)
            {
                let childPosition: [ number, number ] =
                    [ 0, currentPosition[1] + nodeMetadata.height + this.layout.layoutConfiguration.verticalSpacing ];
                for (const nextChildNode of childNodes)
                {
                    childPosition = this.layoutNode(nextChildNode, childPosition);
                }

                positionToReturn = this.layoutParent(nodeMetadata, currentPosition);

                if ((!nodeMetadata.isRoot()) && (currentPosition[0] != 0))
                {
                    // Since subtrees can overlap, check for conflicts and shift tree right if needed
                    positionToReturn = this.resolveOverlaps(nodeMetadata, positionToReturn);
                }
            }
            else
            {
                // This is a non leaf node without children.  We can lay it out as if it's a new leaf node
                positionToReturn = this.layoutParentWithoutChildren(nodeMetadata, currentPosition);
            }
        }

        return positionToReturn;
    }

    private layoutLeafWrapperNode(nodeMetadata: LeafWrapperNodeMetadata,
                                  currentPosition: [ number, number ]): [ number, number ]
    {
        const graph = this.layout.graph as EditableOrgChartMaxGraph;
        const graphTheme = graph.graphTheme;
        const leafEdgeStyle = graphTheme.getEdgeStyleForLeafNode();

        const savedYPosition = currentPosition[1];
        const startingYPositionControlPoint = new Point(undefined, savedYPosition);

        nodeMetadata.relativeX = currentPosition[0];
        nodeMetadata.relativeY = currentPosition[1];

        // Add a small indent if the parent only has this one child
        const isOnlyChild = (nodeMetadata.parentNode?.childNodes.length == 1);
        if (isOnlyChild)
        {
            currentPosition[0] += this.layout.layoutConfiguration.childIndent; // Add small indent
        }

        const childNodes: NodeLayoutMetadata[] = nodeMetadata.childNodes;
        for (const nextChildNode of childNodes)
        {
            const childCell = nextChildNode.cell;

            console.trace(`Layout node, ${childCell.value} as Leaf at ${currentPosition[0]},${currentPosition[1]}`);

            nextChildNode.relativeX = currentPosition[0];
            nextChildNode.relativeY = currentPosition[1];

            currentPosition[1] =
                currentPosition[1] + nextChildNode.height + this.layout.layoutConfiguration.verticalSpacing / 2;

            // FIXME - This is a hack.  Need to find the edge that is visible.  A child should just have two edges, with
            // one being visible.  This may change in the future, so the logic here is a bit of a hack
            let childCellEdge = childCell.edges[0];
            if (!childCellEdge.isVisible())
            {
                childCellEdge = childCell.edges[1];
            }
            const edgeCellStyle = childCellEdge.style;

            edgeCellStyle.edgeStyle = leafEdgeStyle;

            // It makes no sense, but terminal points of the edge cannot be set by the edge style function.  The edge
            // style only handle intermediate points
            edgeCellStyle.entryX = 0;
            edgeCellStyle.entryY = 0.5;

            // If there are other children, then we add a control point for where the first bend is
            const childCellGeometry = childCellEdge.geometry;
            if (!childCellGeometry)
            {
                throw new Error("Edge geometry is null");
            }
            if (isOnlyChild)
            {
                // If no other children, we change the exit point
                if (!nodeMetadata.parentNode)
                {
                    throw new Error("Could not get parent node of child");
                }
                edgeCellStyle.exitDx = -nodeMetadata.parentNode.width / 2 +
                                       (this.layout.layoutConfiguration.childIndent - this.layout.leafEdgeLeftOffset);

                // If we're updating layout, we need to set existing state
                const existingState = graph.view.getState(childCellEdge);
                if (existingState)
                {
                    existingState.style.exitDx = edgeCellStyle.exitDx;
                }

                // If we're updating layout, setting points to null
                childCellGeometry.points = null;
            }
            else
            {
                // If we're updating layout, we need to set existing state
                const existingState = graph.view.getState(childCellEdge);
                if (existingState)
                {
                    existingState.style.exitDx = 0;
                }

                // If there are other children, then we add a control point for where the first bend is
                childCellGeometry.points = [ startingYPositionControlPoint ];
            }
        }

        const newXPosition =
            currentPosition[0] + nodeMetadata.width + this.layout.layoutConfiguration.horizontalSpacing;

        console.trace(`Layout leaf end.  Returning position [${newXPosition}, ${savedYPosition}]`);

        return [ newXPosition, savedYPosition ];
    }

    private layoutParentWithoutChildren(leafNodeMetadata: NodeLayoutMetadata,
                                        currentPosition: [ number, number ]): [ number, number ]
    {
        leafNodeMetadata.relativeX = currentPosition[0];
        leafNodeMetadata.relativeY = currentPosition[1];

        const newXPosition =
            currentPosition[0] + leafNodeMetadata.width + this.layout.layoutConfiguration.horizontalSpacing;
        return [ newXPosition, currentPosition[1] ];
    }

    private layoutParent(nodeMetadata: NodeLayoutMetadata, currentPosition: [ number, number ]): [ number, number ]
    {
        console.trace(`Layout Parent node, ${nodeMetadata.cell.value}, at ${currentPosition[0]},${currentPosition[1]}`);

        nodeMetadata.relativeY = currentPosition[1];

        const childNodes = nodeMetadata.childNodes;
        if (childNodes.length == 1)
        {
            console.trace("Parent has one child");

            if (currentPosition[0] == 0)
            {
                console.trace("Parent is left most sibling");

                nodeMetadata.relativeX = childNodes[0].relativeX;
            }
            else
            {
                console.trace("Parent is NOT left most sibling");

                // Not the leftmost node
                nodeMetadata.relativeX = currentPosition[0];

                // Add an adjustment to all child nodes
                const midpointOfNode = nodeMetadata.relativeX + nodeMetadata.width / 2;
                const midpointOfChild = childNodes[0].relativeX + childNodes[0].width / 2;
                nodeMetadata.xAdjustment = midpointOfNode - midpointOfChild;

                console.trace(`Added adjustment to parent of, ${nodeMetadata.xAdjustment}`);
            }
        }
        else
        {
            console.trace("Parent has multiple children");

            // This differs slightly from the Reingold-Tilford Algorithm
            // Find the midpoint between the midpoints of the left most and right most child
            // This is the center of the edges being drawn from parent to children
            const leftMostChildX = childNodes[0].relativeX + childNodes[0].width / 2;
            const rightMostChild = childNodes[childNodes.length - 1];
            const rightMostChildX = rightMostChild.relativeX + rightMostChild.width / 2;
            const childMidpoint = leftMostChildX + (rightMostChildX - leftMostChildX) / 2;

            if (currentPosition[0] == 0)
            {
                console.trace("Parent is left most sibling");

                // Set the parent position so that the parent's midpoint is at the child midpoint
                nodeMetadata.relativeX = childMidpoint - nodeMetadata.width / 2;

                console.trace(`Set Parent X position to midpoint of all children, ${nodeMetadata.relativeX}`);
            }
            else
            {
                console.trace("Parent is NOT left most sibling");

                // The parent is not the left most node on it's relativeY
                const xAdjustment = currentPosition[0] + nodeMetadata.width / 2 - childMidpoint;
                if (xAdjustment > 0)
                {
                    console.trace("Parent is further right than child midpoint.");

                    nodeMetadata.relativeX = currentPosition[0];
                    nodeMetadata.xAdjustment = xAdjustment;

                    console.trace(`Added adjustment to parent of, ${nodeMetadata.xAdjustment}`);
                }
                else
                {
                    console.trace("Children midpoint further right then Parent");

                    nodeMetadata.relativeX = currentPosition[0] - xAdjustment;

                    console.trace(`Set Parent X position to midpoint of all children, ${nodeMetadata.relativeX}`);
                }
            }
        }

        const newXPosition =
            nodeMetadata.relativeX + nodeMetadata.width + this.layout.layoutConfiguration.horizontalSpacing;

        console.trace(`Layout Parent end.  Returning position [${newXPosition}, ${currentPosition[1]}]`);

        return [ newXPosition, currentPosition[1] ];
    }

    private resolveOverlaps(nodeMetadata: NodeLayoutMetadata, currentPosition: [ number, number ]): [ number, number ]
    {
        console.trace(`Resolve overlaps for ${nodeMetadata.cell.value} at current position, ${currentPosition[0]},${
            currentPosition[1]}`);

        // This is done by checking the difference between subtree "contours"
        const minDistance = this.layout.layoutConfiguration.horizontalSpacing + this.layout.leafEdgeLeftOffset;

        const leftContour = nodeMetadata.leftContour;
        const parentNode = nodeMetadata.parentNode;
        if (!parentNode)
        {
            // Should never happen, as this method should not be called with root
            throw Error("no parent node");
        }

        const childNodes = parentNode.childNodes;

        let shiftValue = 0;
        let index = 0;
        let nextChildNode = childNodes[index];
        do
        {
            const rightContour = nextChildNode.rightContour;

            for (let level = 1; level < Math.min(leftContour.length, rightContour.length); level++)
            {
                const distance = leftContour[level] - rightContour[level];
                if (distance < minDistance)
                {
                    shiftValue = Math.max(shiftValue, minDistance - distance);
                }
            }

            nextChildNode = childNodes[++index];
        } while (nextChildNode != nodeMetadata);

        if (shiftValue > 0)
        {
            console.trace(`Overlap shift required, ${shiftValue}`);

            nodeMetadata.relativeX += shiftValue;
            nodeMetadata.xAdjustment += shiftValue;
        }

        const newXPosition =
            nodeMetadata.relativeX + nodeMetadata.width + this.layout.layoutConfiguration.horizontalSpacing;

        console.trace(`Resolve overlap end.  Returning position [${newXPosition}, ${currentPosition[1]}]`);

        return [ newXPosition, currentPosition[1] ];
    }
}

export {NodePreLayoutStep};