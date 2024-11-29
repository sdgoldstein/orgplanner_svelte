import {
    Cell,
    CellOverlay,
    CellState,
    ConnectionHandler,
    constants,
    Dictionary,
    EventObject,
    ImageBox,
    InternalEvent,
    SelectionHandler
} from "@maxgraph/core";
import {OrgPlannerAppEvents} from "@src/components/page/orgPageEvents";
import {type PubSubEvent, type PubSubListener, PubSubManager} from "orgplanner-common/jscore";
import type {Employee, OrgStructure} from "orgplanner-common/model";

import type {OrgChartEntityVisibleState} from "../../../orgChartViewState";

import {OrgChartEditorEdgeVerifier} from "./orgChartEditorEdgeVerifier";
import {EditableOrgChartMaxGraph} from "../../editable/editbleOrgChartMaxGraph";
import {
    OrgPlannerChartEmployeeVertex,
    OrgPlannerChartTeamVertex,
    type OrgPlannerChartVertex,
    VertexType
} from "./orgPlannerChartModel";
import type {OrgChartMaxGraphThemeDefault} from "../themes/orgChartMaxGraphThemeDefault";

class ModifiableOrgChartMaxGraph extends EditableOrgChartMaxGraph implements PubSubListener
{
    private _addOverlay: CellOverlay;
    private _editOverlay: CellOverlay;

    constructor(element: HTMLElement, orgStructure: OrgStructure, theme: OrgChartMaxGraphThemeDefault,
                viewState: OrgChartEntityVisibleState)
    {
        super(element, orgStructure, theme, viewState);

        PubSubManager.instance.registerListener(OrgPlannerAppEvents.DELETE_SELECTED_EMPLOYEES_FROM_PLAN, this);
        PubSubManager.instance.registerListener(OrgPageEvents.ADD_EMPLOYEE, this);
        PubSubManager.instance.registerListener(OrgPlannerAppEvents.EMPLOYEE_EDITED, this);

        const addImage = new ImageBox("resources/images/symbols.svg#add", 18, 18);
        this._addOverlay = new CellOverlay(addImage, "Add", constants.ALIGN.RIGHT, constants.ALIGN.BOTTOM);
        this._addOverlay.cursor = constants.CURSOR.TERMINAL_HANDLE;
        this._addOverlay.addListener(InternalEvent.CLICK, (sender: EventTarget, event: EventObject) => {});

        const editImage = new ImageBox("resources/images/resources/images/symbols.svg#edit", 18, 18);
        this._editOverlay = new CellOverlay(editImage, "Edit", constants.ALIGN.RIGHT, constants.ALIGN.TOP);
        this._editOverlay.cursor = constants.CURSOR.TERMINAL_HANDLE;
        this._editOverlay.addListener(InternalEvent.CLICK, (sender: EventTarget, event: EventObject) => {});
    }

    disconnect(): void
    {
        super.disconnect();

        PubSubManager.instance.unregisterListener(OrgPlannerAppEvents.DELETE_SELECTED_EMPLOYEES_FROM_PLAN, this);
        PubSubManager.instance.unregisterListener(OrgPageEvents.ADD_EMPLOYEE, this);
        PubSubManager.instance.unregisterListener(OrgPlannerAppEvents.EMPLOYEE_EDITED, this);
    }

    protected getOrgStructure(): OrgStructure
    {
        return this.orgStructure;
    }

    protected setmxGraphBehavior(): void
    {
        super.setmxGraphBehavior();

        this.isCellMovable = (cell: Cell): boolean => { return cell !== this.rootCell };

        this.isCellSelectable = (cell: Cell): boolean => {
            // comment
            return true;
        };

        const selectionHandler: SelectionHandler = this.getPlugin("SelectionHandler") as SelectionHandler;
        selectionHandler.connectOnDrop = true;

        const dropHandler: DropHandler = this.getPlugin(DropHandler.pluginId) as DropHandler;
        const originalDrop = dropHandler.drop;
        dropHandler.drop = (source: Cell, target: Cell, evt: MouseEvent): void => {
            originalDrop.apply(dropHandler, [ target, source, evt ]);
        };

        this.multiplicities.push(
            new OrgChartEditorEdgeVerifier(true, "Manager", "", "", undefined, undefined, [], "", ""));

        const connectionHandler: ConnectionHandler = this.getPlugin(ConnectionHandler.pluginId) as ConnectionHandler;
        connectionHandler.addListener(InternalEvent.CONNECT, (sender: any, event: EventObject) => {
            const newEdge = event.getProperty("cell") as Cell;
            const newEdgeTarget = newEdge.target;
            if (!newEdgeTarget)
            {
                throw new Error("Connect event without source");
            }
            const edgesToExamine = newEdgeTarget.edges;
            const edgesToRemove = [];
            for (const nextEdge of edgesToExamine)
            {
                // Not sure this is the right check.  New edge has the IC as the source and the manager as the target?
                if (((nextEdge !== newEdge) && (nextEdge.target == newEdgeTarget)) ||
                    ((nextEdge.target == newEdgeTarget) && (nextEdge.target == newEdge.source)))
                {
                    edgesToRemove.push(nextEdge);
                }
            }

            this.removeCells(edgesToRemove, false);

            // Adjust the planning tree
            if (!newEdge.source)
            {
                throw new Error("Connection being made without a source node");
            }

            const targetVertex = newEdgeTarget.value as OrgPlannerChartVertex;
            if (targetVertex.getVertexType() !== VertexType.TEAM)
            {
                this.orgStructure.moveEmployeeToManager(
                    (targetVertex as OrgPlannerChartEmployeeVertex).employee,
                    (newEdge.source.value as OrgPlannerChartEmployeeVertex).employee);
            }
            else
            {
                this.orgStructure.moveTeamToManager((targetVertex as OrgPlannerChartTeamVertex).team,
                                                    (newEdge.source.value as OrgPlannerChartEmployeeVertex).employee);
            }
        });

        this.addListener(InternalEvent.DOUBLE_CLICK, (sender: any, mouseEvent: EventObject) => {
            const cell = mouseEvent.getProperty("cell") as Cell;
            if (cell)
            {
                const vertexValue = cell.getValue() as OrgPlannerChartVertex;

                // let eventToFire = new OpenEditEmployeeModalEvent(vertexValue.employee);
                //  FUCK PubSubManager.instance.fireEvent(eventToFire);
            }

            mouseEvent.consume();
        });
    }

    private deleteSelectedEmployee(): void
    {
        const cellsToRemove: Cell[] = [];
        const employeesToRemove: Employee[] = [];
        const teamsToRemove = [];

        const selectedCells: Cell[] = this.getSelectionCells();

        selectedCells.forEach((nextSelectedCell: Cell) => {
            this.traverse(nextSelectedCell, true, (vertex: Cell, edge: Cell) => {
                cellsToRemove.push(vertex);
                const vertexValue = vertex.value as OrgPlannerChartVertex;
                if (vertexValue instanceof OrgPlannerChartTeamVertex)
                {
                    teamsToRemove.push(vertexValue.team);
                }
                else
                {
                    employeesToRemove.push((vertexValue as OrgPlannerChartEmployeeVertex).employee);
                }
            });
        });

        this.removeCells(cellsToRemove, true);
        this.orgStructure.removeEmployees(employeesToRemove);
    }

    // Copied from inside maxgraph because it doesn't appear to be exposed
    private traverse(vertex: Cell|null = null, directed = true, func: Function|null = null, edge: Cell|null = null,
                     visited: Dictionary<Cell, boolean>|null = null, inverse = false): void
    {
        if (func != null && vertex != null)
        {
            directed = directed != null ? directed : true;
            inverse = inverse != null ? inverse : false;
            visited = visited || new Dictionary<Cell, boolean>();

            if (!visited.get(vertex))
            {
                visited.put(vertex, true);
                const result = func(vertex, edge);

                if (result == null || result)
                {
                    const edgeCount = vertex.getEdgeCount();

                    if (edgeCount > 0)
                    {
                        for (let i = 0; i < edgeCount; i += 1)
                        {
                            const e = vertex.getEdgeAt(i);
                            const isSource = e.getTerminal(true) == vertex;

                            if (!directed || !inverse == isSource)
                            {
                                const next = e.getTerminal(!isSource);
                                this.traverse(next, directed, func, e, visited, inverse);
                            }
                        }
                    }
                }
            }
        }
    }

    private employeeEdited(employee: Employee): void
    {
        this.batchUpdate(() => {
            const vertex: Cell|null = this.model.getCell(employee.id);
            if (!vertex)
            {
                throw new Error("Could not find cell for edited employee");
            }

            const cellState: CellState|null = this.view.getState(vertex);
            if (!cellState)
            {
                throw new Error("Could not find cell state for edited employee");
            }

            this.cellRenderer.redrawLabel(cellState, true);
        });
    }

    onEvent(eventName: string, event: PubSubEvent): void
    {
        if (eventName === OrgPlannerAppEvents.DELETE_SELECTED_EMPLOYEES_FROM_PLAN)
        {
            this.deleteSelectedEmployee();
        }
        else if (eventName === OrgPageEvents.ADD_EMPLOYEE)
        {

            this.addEmployee((event as NewEmployeeEvent).newEmployee);
        }
        else if (eventName === OrgPlannerAppEvents.EMPLOYEE_EDITED)
        {
            // let employee = (event as EmployeeEditedEvent).employee;

            // this.employeeEdited(employee);
        }
        else
        {
            super.onEvent(eventName, event);
        }
    }
}

export {ModifiableOrgChartMaxGraph};
