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

import type {OrgChartEntityVisibleState} from "../../../orgChartViewState";

import {
    OrgPlannerChartEmployeeVertex,
    OrgPlannerChartTeamVertex,
} from "../../common/core/orgPlannerChartModel";
import type {MaxGraphTheme} from "../../common/themes/maxGraphTheme";
import {OrgChartVertexHandler} from "../../common/themes/orgChartVertexHandler";
import {OrgChartMaxGraphBase} from "../shared/orgChartMaxGraphBase";
import type {OrgChartMaxGraphAssemblyService} from "../shared/orgChartMaxGraphAssemblyService";
import {
    DeleteEntityCellActionEvent,
    EditEntityCellActionEvent,
    OrgChartSelectionChangedEvent
} from "../../../OrgChartEvents";
import {EditableOrgChartMaxGraphAssemblyService} from "./editableOrgChartMaxGraphAssemblyService";
import {
    type EntityViewToggableOrgChartMaxGraph,
} from "../shared/viewToggableEntityEventHandler";
import type {OrgChartMaxGraph} from "../../common/core/orgChartMaxGraph";
import {OrgChartSelectionHandler} from "../../common/themes/orgChartSelectionHandler";
import {OrgChartConnectionHandler} from "../../common/themes/orgChartConnectionHandler";

/**
 * The org chart graph visual component.
 *
 * It delegates to the OrgChartMaxGraphAssemblyService to add or remove visual elements to the graph.  Otherwise, all
 * other actions/logic it handles directly.  It also is responsible for directly updated the underlying orgstructure
 * when changs occur
 */
class EditableOrgChartMaxGraph extends OrgChartMaxGraphBase implements EntityViewToggableOrgChartMaxGraph,
                                                                       OrgChartMaxGraph
{
    constructor(element: HTMLElement, orgStructure: OrgStructure, theme: MaxGraphTheme,
                visibilityState: OrgChartEntityVisibleState)
    {
        super(element, orgStructure, theme, visibilityState, new EditableOrgChartMaxGraphAssemblyService(),
              [ OrgChartSelectionHandler, OrgChartConnectionHandler ]);

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

    validateEdge: (edge: Cell, source: Cell, target: Cell) => string | null = (edge: Cell, source: Cell,
                                                                               target: Cell) => { return null; }

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

            this.orgChartMaxGraphAssemblyService.augmentCellTemp(cellAdded, this.visibilityState);

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
}

export {EditableOrgChartMaxGraph};
