import {
    Cell,
    CellHighlight,
    constants,
    EventSource,
    Graph,
    InternalEvent,
    InternalMouseEvent,
    SelectionHandler
} from "@maxgraph/core";
import {OrgEntityTypes, type OrgEntityType} from "orgplanner-common/model";

class OrgChartSelectionHandler extends SelectionHandler
{
    constructor(graph: Graph)
    {
        super(graph);

        // Seems like to things can heppen on drop - connect to or move into the target.  We want neither, but will be
        // able to customize the bahavior in the connection handler itself
        this.connectOnDrop = true;
    }

    // FIXME - Unfortunatley, we need to override this entire method, as there isn't enough flexibilty around Drag&Drop
    //  Most of this is copied, with much taken out for things that are not needed at the moment
    // Removed Multitouch events
    // Cloning
    // Guides
    // grid
    mouseMove(sender: EventSource, me: InternalMouseEvent): void
    {
        const {graph} = this;

        if (!me.isConsumed() && graph.isMouseDown && this.cell && this.first && this.bounds && !this.suspended)
        {
            let delta = this.getDelta(me);
            const tol = graph.getEventTolerance();

            if (this.shape || this.livePreviewActive || Math.abs(delta.x) > tol || Math.abs(delta.y) > tol)
            {
                // Highlight is used for highlighting drop targets
                if (!this.highlight)
                {
                    this.highlight = new CellHighlight(this.graph, constants.DROP_TARGET_COLOR, 2);
                }

                const cell = me.getCell();
                let target: Cell|null = null;

                if (graph.isDropEnabled() && this.highlightEnabled && this.cells)
                {
                    // Contains a call to getCellAt to find the cell under the mouse
                    target = graph.getDropTarget(this.cells, me.getEvent(), cell, false);
                }

                let state = target ? graph.getView().getState(target) : null;
                let highlight = false;

                if (state && (target && this.isValidDropTarget(target, me)))
                {
                    if (this.target !== target)
                    {
                        this.target = target;
                        this.setHighlightColor(constants.DROP_TARGET_COLOR);
                    }

                    highlight = true;
                }
                else
                {
                    this.target = null;

                    if (this.connectOnDrop && cell && this.cells && this.cells.length === 1 && cell.isVertex() &&
                        cell.isConnectable())
                    {
                        state = graph.getView().getState(cell);

                        if (state)
                        {
                            // This is where I change behavior to not show error if a drop target is not valid
                            const error = graph.getEdgeValidationError(null, this.cell, cell);
                            if ((error === null) && this.isOrgChartEdgeValid(this.cell, cell))
                            {
                                this.setHighlightColor(constants.VALID_COLOR);
                                highlight = true;
                            }
                        }
                    }
                }

                if (state && highlight)
                {
                    this.highlight.highlight(state);
                }
                else
                {
                    this.highlight.hide();
                }

                delta = this.graph.snapDelta(delta, this.bounds, true, false, false);

                // Constrained movement if shift key is pressed
                if (graph.isConstrainedEvent(me.getEvent()))
                {
                    if (Math.abs(delta.x) > Math.abs(delta.y))
                    {
                        delta.y = 0;
                    }
                    else
                    {
                        delta.x = 0;
                    }
                }

                this.checkPreview();

                if (this.currentDx !== delta.x || this.currentDy !== delta.y)
                {
                    this.currentDx = delta.x;
                    this.currentDy = delta.y;
                    this.updatePreview();
                }
            }

            this.updateHint(me);
            this.consumeMouseEvent(InternalEvent.MOUSE_MOVE, me);

            // Cancels the bubbling of events to the container so
            // that the droptarget is not reset due to an mouseMove
            // fired on the container with no associated state.
            InternalEvent.consume(me.getEvent());
        }
        else if (this.isMoveEnabled() && this.updateCursor && !me.isConsumed() && (me.getState() || me.sourceState) &&
                 !graph.isMouseDown)
        {
            let cursor = graph.getCursorForMouseEvent(me);
            const cell = me.getCell();

            if (!cursor && cell && graph.isEnabled() && graph.isCellMovable(cell))
            {
                if (cell.isEdge())
                {
                    cursor = constants.CURSOR.MOVABLE_EDGE;
                }
                else
                {
                    cursor = constants.CURSOR.MOVABLE_VERTEX;
                }
            }

            // Sets the cursor on the original source state under the mouse
            // instead of the event source state which can be the parent
            if (cursor && me.sourceState)
            {
                me.sourceState.setCursor(cursor);
            }
        }
    }

    // We swap target and source because in our context, it's opposite of maxgraph
    // Source will be the parent and target
    isOrgChartEdgeValid(target: Cell, source: Cell): boolean
    {
        let valueToReturn = true;

        const sourceEntity = source.getValue().orgEntity;
        const targetEntity = target.getValue().orgEntity;

        const targetEntityType: OrgEntityType = targetEntity.orgEntityType;
        const sourceEntityType: OrgEntityType = sourceEntity.orgEntityType;

        // First, check types
        if (sourceEntity.orgEntityType === OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR)
        {
            valueToReturn = false;
        }
        else if ((sourceEntityType === OrgEntityTypes.TEAM) && (targetEntityType === OrgEntityTypes.TEAM))
        {
            valueToReturn = false;
        }
        else
        {
            // Now, check existing edges and make sure the edge doesn't already exist
            let currentEdgesFromSource: Cell[] = source.getOutgoingEdges();
            for (let nextCurrentEdge of currentEdgesFromSource)
            {
                valueToReturn &&= (nextCurrentEdge.target !== target);
            }
        }

        return valueToReturn;
    }
}
export {OrgChartSelectionHandler};