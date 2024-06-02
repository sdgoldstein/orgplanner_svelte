import {Cell, Graph, Multiplicity} from "@maxgraph/core";

import {OrgPlannerChartEmployeeVertex} from "./orgPlannerChartModel";

// FUCKimport {OpenEditEmployeeModalEvent} from "../orgPlannerEditEmployeeModalWC/orgPlannerEditEmployeeModalWC";
class OrgChartEditorEdgeVerifier extends Multiplicity
{
    constructor(source: boolean, type: string, attr: string, value: string, min: number|null|undefined,
                max: number|null|undefined, validNeighbors: string[], countError: string, typeError: string,
                validNeighborsAllowed?: boolean)
    {
        super(source, type, attr, value, min, max, validNeighbors, countError, typeError, validNeighborsAllowed);
    }

    /**
     * Checks if the proposed connection is valid
     *
     * @param graph Reference to the enclosing {@link graph} instance.
     * @param edge {@link mxCell} that represents the edge to validate.
     * @param proposedChild {@link mxCell} that represents the source terminal.
     * @param proposedParent {@link mxCell} that represents the target terminal.
     * @param sourceOut Number of outgoing edges from the source terminal.
     * @param targetIn Number of incoming edges for the target terminal.
     */
    check(graph: Graph, edge: Cell, proposedChild: Cell, proposedParent: Cell, sourceOut: number,
          targetIn: number): string|null
    {
        let checkPassed: boolean = true;
        let reason;

        checkPassed = (proposedParent.getValue() as OrgPlannerChartEmployeeVertex).canBeParent();
        if (!checkPassed)
        {
            reason = "Invalid Parent";
        }
        else
        {
            // Checks if they're not already connected (is there a better way to do this?)
            const edgesBetween = graph.getDataModel().getEdgesBetween(proposedParent, proposedChild, true);
            if (edgesBetween.length > 1 || (edgesBetween.length === 1 && edgesBetween[0] !== edge))
            {
                checkPassed = false;
                reason = "Already connected";
            }
            else
            {
                checkPassed = !this.isCycle(proposedChild, proposedParent);
                reason = "No cycles allowed in organiation";
            }
        }

        return checkPassed ? null : reason;
    }

    private isCycle(proposedChild: Cell, proposedParent: Cell): boolean
    {
        let isCycle: boolean = false;

        // if the cell is the end node, or the cell have no edge,just put
        if (proposedChild.getEdgeCount() != 0)
        {
            const edgeIterator = proposedChild.edges.values();
            let nextEdgeEntry = edgeIterator.next();
            do
            {
                const nextEdge = nextEdgeEntry.value as Cell;
                if ((nextEdge.target) && (nextEdge.target.id != proposedChild.id))
                {
                    if (nextEdge.target.id == proposedParent.id)
                    {
                        // loop found
                        isCycle = true;
                    }
                    else
                    {
                        isCycle = this.isCycle(nextEdge.target, proposedParent);
                    }
                }

                nextEdgeEntry = edgeIterator.next();
            } while ((!isCycle) && (!nextEdgeEntry.done));
        }

        return isCycle;
    }
}

export {OrgChartEditorEdgeVerifier};