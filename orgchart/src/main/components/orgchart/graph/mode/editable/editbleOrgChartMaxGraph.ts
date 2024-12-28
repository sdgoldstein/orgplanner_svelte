/**
 * Drag and Drop
 * 2.  Appropriately UI and UI Feedback
 * 4.  Update to Tree
 * 5.  Stats
 * 6.  Snapshots
 */

import {Cell, CellState, type CellStateStyle, EventObject, VertexHandler} from "@maxgraph/core";

import {PubSubManager} from "orgplanner-common/jscore";
import {OrgEntityTypes, type Employee, type OrgEntity, type OrgStructure, type Team} from "orgplanner-common/model";

import type {OrgChartEntityVisibleState} from "../../../orgChartViewState";

import {
    OrgPlannerChartEmployeeVertex,
    OrgPlannerChartTeamVertex,
    type OrgPlannerChartVertex,
} from "../../common/core/orgPlannerChartModel";
import type {MaxGraphTheme} from "../../common/themes/maxGraphTheme";
import {OrgChartVertexHandler} from "../../common/themes/orgChartVertexHandler";
import {OrgChartMaxGraphBase} from "../shared/orgChartMaxGraphBase";
import type {OrgChartMaxGraphAssemblyService} from "../shared/orgChartMaxGraphAssemblyService";
import {
    DeleteEmployeeCellActionEvent,
    DeleteTeamCellActionEvent,
    EditEmployeeCellActionEvent,
    EditTeamCellActionEvent,
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

        orgChartMaxGraphBuilderService.createDeleteEmployeeButtonOverlay((sender: EventTarget, event: EventObject) => {
            const cellToEdit = event.getProperty("cell") as Cell;
            const employeeToDelete = (cellToEdit.value as OrgPlannerChartEmployeeVertex).orgEntity;
            const eventToFire = new DeleteEmployeeCellActionEvent(employeeToDelete);
            PubSubManager.instance.fireEvent(eventToFire);
        });
        orgChartMaxGraphBuilderService.createEditEmployeeButtonOverlay((sender: EventTarget, event: EventObject) => {
            const cellToEdit = event.getProperty("cell") as Cell;
            const employeeToEdit = (cellToEdit.value as OrgPlannerChartEmployeeVertex).orgEntity;
            const eventToFire = new EditEmployeeCellActionEvent(employeeToEdit);
            PubSubManager.instance.fireEvent(eventToFire);
        });

        orgChartMaxGraphBuilderService.createDeleteTeamButtonOverlay((sender: EventTarget, event: EventObject) => {
            const cellToEdit = event.getProperty("cell") as Cell;
            const teamToDelete = (cellToEdit.value as OrgPlannerChartTeamVertex).orgEntity;
            const eventToFire = new DeleteTeamCellActionEvent(teamToDelete);
            PubSubManager.instance.fireEvent(eventToFire);
        });
        orgChartMaxGraphBuilderService.createEditTeamButtonOverlay((sender: EventTarget, event: EventObject) => {
            const cellToEdit = event.getProperty("cell") as Cell;
            const teamToEdit = (cellToEdit.value as OrgPlannerChartTeamVertex).orgEntity;
            const eventToFire = new EditTeamCellActionEvent(teamToEdit);
            PubSubManager.instance.fireEvent(eventToFire);
        });
    }

    createVertexHandler(state: CellState): VertexHandler
    {
        return new OrgChartVertexHandler(state);
    }

    validateEdge: (edge: Cell, source: Cell, target: Cell) => string | null =
        (edge: Cell, source: Cell, target: Cell) => {
            let errorToReturn = null;

            const targetEntity = target.getValue().orgEntity;
            if (targetEntity.orgEntityType === OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR)
            {
                errorToReturn = "Cannot connect to an individual contributor";
            }

            return errorToReturn;
        }

    addTeam(team: Team): void
    {
        this.batchUpdate(() => {
            const teamCell = this.orgChartMaxGraphAssemblyService.addTeamNode(team);
            this.orgChartMaxGraphAssemblyService.augmentCellTemp(teamCell, this.visibilityState);

            this._postAddEntity(teamCell);
        });
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
            this.orgChartMaxGraphAssemblyService.augmentCellTemp(cellAdded, this.visibilityState);

            this._postAddEntity(cellAdded);
        });
    }

    private _postAddEntity(cellAdded: Cell)
    {
        const managerId = cellAdded.getValue().orgEntity.managerId;
        const managerCell = this.model.getCell(managerId);
        if (managerCell != null)
        {
            // It hsould always be non-null
            this.showHideSubtree(managerCell, true);
        }

        // Set the newly added cell to be selected
        this.setSelectionCell(cellAdded);

        const eventToFire = new OrgChartSelectionChangedEvent([ cellAdded.getValue().orgEntity ]);
        PubSubManager.instance.fireEvent(eventToFire);
    }

    entityEdited(entity: OrgEntity): void
    {
        this.batchUpdate(() => {
            const vertex: Cell|null = this.model.getCell(entity.id);
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

    public entitiesDeleted(entitiesToRemove: OrgEntity[])
    {
        this.batchUpdate(() => {
            const cellsToRemove: Cell[] = [];
            entitiesToRemove.forEach((nextEntityToRemove) => {
                const vertex: Cell|null = this.model.getCell(nextEntityToRemove.id);
                if (!vertex)
                {
                    throw new Error("Could not find cell for deleted entity");
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
