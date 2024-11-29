/**
 * Drag and Drop
 * 2.  Appropriately UI and UI Feedback
 * 4.  Update to Tree
 * 5.  Stats
 * 6.  Snapshots
 */

import {Cell, CellState, type CellStateStyle, EventObject, VertexHandler} from "@maxgraph/core";

import {PubSubManager} from "orgplanner-common/jscore";
import type {Employee, OrgStructure, Team} from "orgplanner-common/model";

import type {OrgChartEntityVisibleState} from "../../orgChartViewState";

import {
    OrgPlannerChartEmployeeVertex,
    OrgPlannerChartModel,
    OrgPlannerChartTeamVertex,
    type OrgPlannerChartVertex
} from "../common/core/orgPlannerChartModel";
import type {MaxGraphTheme} from "../common/themes/maxGraphTheme";
import {OrgChartVertexHandler} from "../common/themes/orgChartVertexHandler";
import {OrgChartMaxGraphBase} from "../base/orgChartMaxGraphBase";
import type {OrgChartMaxGraphAssemblyService} from "../model/orgChartMaxGraphAssemblyService";
import {
    DeleteEntityCellActionEvent,
    EditEntityCellActionEvent,
    OrgChartSelectionChangedEvent
} from "../../OrgChartEvents";

/**
 * The org chart graph visual component.
 *
 * It delegates to the OrgChartMaxGraphAssemblyService to add or remove visual elements to the graph.  Otherwise, all
 * other actions/logic it handles directly.  It also is responsible for directly updated the underlying orgstructure
 * when changs occur
 */
class EditableOrgChartMaxGraph extends OrgChartMaxGraphBase
{
    constructor(element: HTMLElement, orgStructure: OrgStructure, theme: MaxGraphTheme,
                visibilityState: OrgChartEntityVisibleState)
    {
        super(element, orgStructure, theme, visibilityState);

        /* fix to
         * https://stackoverflow.com/questions/66452387/error-in-mxgraph-firemouseevent-failed-to-execute-getcomputedstyle-on-windo
         */
        // Utils.getOffset = getOffsetWorkaround;
        //  Swaps drop target and source for edge creation
        // this.graphHandler.mouseUp = graphHandlerMouseUpWorkaround;

        // this.orgStructure = orgStructure;
        // this._graphTheme = theme;
        // this.visibilityState = visibilityState;
    }

    protected setup(orgChartMaxGraphBuilderService: OrgChartMaxGraphAssemblyService): void
    {
        super.setup(orgChartMaxGraphBuilderService);

        orgChartMaxGraphBuilderService.createToggleSubtreeOverlay(
            (sender: EventTarget, event: EventObject) => { this.toggleSubtree(event.getProperty("cell") as Cell); });
        orgChartMaxGraphBuilderService.createDeleteButtonOverlay((sender: EventTarget, event: EventObject) => {
            const cellToEdit = event.getProperty("cell") as Cell;
            const employeeToDelete = (cellToEdit.value as OrgPlannerChartEmployeeVertex).employee;
            const eventToFire = new DeleteEntityCellActionEvent(employeeToDelete);
            PubSubManager.instance.fireEvent(eventToFire);
        });
        orgChartMaxGraphBuilderService.createEditButtonOverlay((sender: EventTarget, event: EventObject) => {
            const cellToEdit = event.getProperty("cell") as Cell;
            const employeeToEdit = (cellToEdit.value as OrgPlannerChartEmployeeVertex).employee;
            const eventToFire = new EditEntityCellActionEvent(employeeToEdit);
            PubSubManager.instance.fireEvent(eventToFire);
        });
    }

    createVertexHandler(state: CellState): VertexHandler
    {
        return new OrgChartVertexHandler(state);
    }

    addEmployee(employeeToAdd: Employee): void
    {
        this.batchUpdate(() => {
            let cellAdded;
            if (employeeToAdd.isManager())
            {
                cellAdded = this.orgChartMaxGraphAssemblyService.addManagerNode(employeeToAdd);
            }
            else
            {
                cellAdded = this.orgChartMaxGraphAssemblyService.addICNode(employeeToAdd);
            }

            // Expand the parent in case it is collapsed so the new cell shows
            const managerCell = this.model.getCell(employeeToAdd.managerId);
            if (managerCell != null)
            {
                // It hsould always be non-null

                this.showHideSubtree(managerCell, true);
            }

            // Set the newly added cell to be selected
            this.setSelectionCell(cellAdded);

            // FIX - Move to selrction handler
            const eventToFire = new OrgChartSelectionChangedEvent([ employeeToAdd ]);
            PubSubManager.instance.fireEvent(eventToFire);
        });
    }

    employeeEdited(employee: Employee): void
    {
        this.batchUpdate(() => {
            const vertex: Cell|null = this.model.getCell(employee.id);
            if (!vertex)
            {
                throw new Error("Could not find cell for edited employee");
            }

            // Is this the best way to force a redraw?
            this.refresh(vertex);

            /*const cellState: CellState|null = this.view.getState(vertex);
            if (!cellState)
            {
                throw new Error("Could not find cell state for edited employee");
            }

            this.cellRenderer.redrawLabel(cellState, true);*/
        });
    }

    public employeesDeleted(employeesToRemove: Employee[])
    {
        this.batchUpdate(() => {
            const cellsToRemove: Cell[] = [];
            employeesToRemove.forEach((nextEmployeeToRemove) => {
                const vertex: Cell|null = this.model.getCell(nextEmployeeToRemove.id);
                if (!vertex)
                {
                    throw new Error("Could not find cell for edited employee");
                }

                cellsToRemove.push(vertex);
            });

            this.removeCells(cellsToRemove);
        });
    }

    // @ts-ignore FIXME = not used
    private insertTeamNode(team: Team, orgChartTeam: OrgPlannerChartTeamVertex, cellStyleOverride: CellStateStyle): Cell
    {
        const parent = this.getDefaultParent();
        const newCell = this.insertVertex(parent, team.title, orgChartTeam, 20, 20, 80, 30, cellStyleOverride);

        const managerCell = this.model.getCell(team.managerId);
        if (managerCell)
        {
            this.insertEdge(parent, team.managerId + team.title, "", managerCell, newCell);
        }

        return newCell;
    }

    private toggleSubtree(cell: Cell): void
    {
        let isCollapsed = false;
        const orgChartVertext: OrgPlannerChartVertex = cell.value as OrgPlannerChartVertex;
        if (orgChartVertext.hasProperty("collapsed"))
        {
            isCollapsed = (orgChartVertext.getProperty("collapsed") == "true");
        }
        this.showHideSubtree(cell, isCollapsed);
    }

    private showHideSubtree(cell: Cell, show: boolean): void
    {
        this.batchUpdate(() => {
            const cells: Cell[] = [];

            this.traverse({
                visitEnter(cellToVisit: Cell) {
                    if (cellToVisit != cell)
                    {
                        cells.push(cellToVisit);

                        // HACK - FIX ME - The only state we have to determine if the cell is expanded or not is the
                        // overlays
                        // const overLays = savedGraph.getCellOverlays(cellToVisit);

                        // If we're expanding and the vertex collapsed, don't expand it - FIXME
                        /*if ((overLays != null) && show && (overLays[0] == savedGraph._collapsedOverlay))
                        {
                            valueToReturn = false;
                        }*/
                    }
                },
                visitLeave(cell: Cell) {

                },
            },
                          cell);

            this.toggleCells(show, cells, true);

            const orgChartVertext: OrgPlannerChartVertex = cell.value as OrgPlannerChartVertex;
            orgChartVertext.setProperty("collapsed", (!show).toString());
            // Is this the best way to force a redraw?
            this.refresh(cell);
        });
    }

    toggleTeamMode(): void
    {
        const chartModel: OrgPlannerChartModel = this.model as OrgPlannerChartModel;
        chartModel.toggleTeamMode();
        this.rehydrate();
    }
}

export {EditableOrgChartMaxGraph};
