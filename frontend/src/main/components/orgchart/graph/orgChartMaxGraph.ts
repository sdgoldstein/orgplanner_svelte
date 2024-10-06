/**
 * Drag and Drop
 * 2.  Appropriately UI and UI Feedback
 * 4.  Update to Tree
 * 5.  Stats
 * 6.  Snapshots
 */

import {Cell, type CellStateStyle, EventObject, Graph, GraphLayout, LayoutManager} from "@maxgraph/core";
import {ServiceManager} from "@sphyrna/service-manager-ts";
import {OrgPlannerAppEvents} from "@src/components/app/orgPlannerAppEvents";
import {DeleteEmployeeFromPlanEvent} from "../orgChartProxy";
import {OrgPlannerAppServicesConstants} from "@src/services/orgPlannerAppServicesConstants";
import {type PubSubEvent, type PubSubListener, PubSubManager} from "orgplanner-common/jscore";
import type {
    Employee, OrgEntity, OrgEntityColorTheme, OrgStructure, OrgStructureVisitor, Team} from "orgplanner-common/model";

import type {OrgChartEntityVisibleState, ViewToggableEntity} from "../orgChartViewState";

import type {OrgChartMaxGraphAssemblyService} from "./assembly/orgChartMaxGraphAssemblyService";
import {OrgPlannerChartLayout} from "./layout/orgPlannerChartLayout";
import {
    OrgPlannerChartEmployeeVertex,
    OrgPlannerChartModel,
    OrgPlannerChartTeamVertex,
    type OrgPlannerChartVertex
} from "./orgPlannerChartModel";
import type {MaxGraphTheme} from "./themes/maxGraphTheme";
import {OrgChartMaxGraphThemeBase} from "./themes/orgChartMaxGraphThemeBase";
import {EditEmployeeActionEvent} from "@src/components/page/orgViewMediator";

/**
 * A visitor used to apply logic while traversing the nodes of the graph
 */
class OrgPlannerChartVisitor
{
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    visitEnter(cell: Cell): void
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    {
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    visitLeave(cell: Cell): void
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    {
    }
}

class OrgPlannerChartLayoutManager extends LayoutManager
{
    private layout: GraphLayout;

    constructor(graph: Graph, layout: GraphLayout)
    {
        super(graph);
        this.layout = layout;

        this.setBubbling(true);
    }

    getLayout(cell: Cell): GraphLayout
    {
        return this.layout;
    }
}

class OrgChartBuildingVisitor implements OrgStructureVisitor
{
    private _orgChartMaxGraphBuilderService: OrgChartMaxGraphAssemblyService;
    rootCell?: Cell;

    constructor(orgChartMaxGraphBuilderService: OrgChartMaxGraphAssemblyService)
    {
        this._orgChartMaxGraphBuilderService = orgChartMaxGraphBuilderService;
    }

    visitEnter(employee: Employee): void
    {
        let newCell: Cell;

        if (employee.isManager())
        {
            newCell = this._orgChartMaxGraphBuilderService.addManagerNode(employee);
            // this._orgChartMaxGraphBuilderService.addToggleSubtreeOverlay(newCell);

            if (!this.rootCell)
            {
                // Root cell is the first manager created
                this.rootCell = newCell;
            }

            // Not sure if this will stay here
            // const orgStructure = this.orgStructure;
            // if (orgStructure.managerHasTeams(manager))
            //{
            //    const teamsForManager = orgStructure.getTeamsForManager(manager);
            //    teamsForManager.forEach(
            //        (team: Team) => {
            // FIXME - not creating team nodes for now
            /*let teamVertex = new OrgPlannerChartTeamVertex(team);
            this.insertTeamNode(team, teamVertex, this.getStylesheet().styles.get("team")!);
            */
            //        });
            //}
        }
        else
        {
            newCell = this._orgChartMaxGraphBuilderService.addICNode(employee);
        }

        // this._orgChartMaxGraphBuilderService.addEditButtonOverlay(newCell);
    }

    visitLeave(employee: Employee): void
    {
        // Do nothing
    }
}

/**
 * The org chart graph visual component.
 *
 * It delegates to the OrgChartMaxGraphAssemblyService to add or remove visual elements to the graph.  Otherwise, all
 * other actions/logic it handles directly.  It also is responsible for directly updated the underlying orgstructure
 * when changs occur
 */
class OrgChartMaxGraph extends Graph implements PubSubListener
{
    orgStructure: OrgStructure;
    visibilityState: OrgChartEntityVisibleState;

    private _isUpdating: boolean = false;
    private _rootCell?: Cell;
    private _layout?: OrgPlannerChartLayout;
    private _graphTheme: MaxGraphTheme;
    private _orgChartMaxGraphBuilderService: OrgChartMaxGraphAssemblyService;

    constructor(element: HTMLElement, orgStructure: OrgStructure, theme: OrgChartMaxGraphThemeBase,
                visibilityState: OrgChartEntityVisibleState)
    {
        super(element, new OrgPlannerChartModel());

        /* fix to
         * https://stackoverflow.com/questions/66452387/error-in-mxgraph-firemouseevent-failed-to-execute-getcomputedstyle-on-windo
         */
        // Utils.getOffset = getOffsetWorkaround;
        //  Swaps drop target and source for edge creation
        // this.graphHandler.mouseUp = graphHandlerMouseUpWorkaround;

        this.orgStructure = orgStructure;
        this._graphTheme = theme;
        this.visibilityState = visibilityState;

        this._orgChartMaxGraphBuilderService =
            ServiceManager.getService(OrgPlannerAppServicesConstants.ORG_CHART_MAX_GRAPH_ASSEMBLY_SERVICE) as
            OrgChartMaxGraphAssemblyService;
        this._orgChartMaxGraphBuilderService.insertGraph(this);
        this._orgChartMaxGraphBuilderService.configureBaseOptions();
        this._orgChartMaxGraphBuilderService.applyTheme(this.graphTheme);
        this._orgChartMaxGraphBuilderService.createToggleSubtreeOverlay(
            (sender: EventTarget, event: EventObject) => { this.toggleSubtree(event.getProperty("cell") as Cell); });
        this._orgChartMaxGraphBuilderService.createDeleteButtonOverlay((sender: EventTarget, event: EventObject) => {
            const cellToDelete = event.getProperty("cell") as Cell;
            this._deleteOrgEntity(cellToDelete);
        });
        this._orgChartMaxGraphBuilderService.createEditButtonOverlay((sender: EventTarget, event: EventObject) => {
            const cellToEdit = event.getProperty("cell") as Cell;
            const employeeToEdit = (cellToEdit.value as OrgPlannerChartEmployeeVertex).employee;
            const eventToFire = new EditEmployeeActionEvent(employeeToEdit);
            PubSubManager.instance.fireEvent(eventToFire);
        });

        PubSubManager.instance.registerListener(OrgPlannerAppEvents.SAVE_AS_IMAGE, this);

        this.initializemxGraph(); // This is doing nothing in the base graph
    }

    private _deleteOrgEntity(cellToDelete: Cell)
    {
        const cellsToDelete: Cell[] = [];
        const employeesToRemove: Employee[] = [];
        const teamsToRemove = [];

        this.traverse({
            visitEnter(cellToVisit: Cell) {
                cellsToDelete.push(cellToVisit);
                let vertexValue = cellToVisit.value;
                if (vertexValue instanceof OrgPlannerChartTeamVertex)
                {
                    teamsToRemove.push(vertexValue.team);
                }
                else
                {
                    employeesToRemove.push(vertexValue.employee);
                }
            },
            visitLeave(cell: Cell) {},
        },
                      cellToDelete);
        this.batchUpdate(() => {
            this._orgChartMaxGraphBuilderService.deleteOrgEntities(cellsToDelete);
            this.orgStructure.removeEmployees(employeesToRemove);
        });
    }

    disconnect(): void
    {
        PubSubManager.instance.unregisterListener(OrgPlannerAppEvents.SAVE_AS_IMAGE, this);
    }

    batchUpdate(fn: () => void): void
    {
        try
        {
            this._isUpdating = true;
            super.batchUpdate(fn);
        }
        finally
        {
            this._isUpdating = false;
        }
    }
    onEvent(eventName: string, event: PubSubEvent): void
    {
        if (eventName === OrgPlannerAppEvents.SAVE_AS_IMAGE)
        {
            this.saveAsImage();
        }
    }

    getSelectedEntity(): OrgEntity
    {
        // FIXME - What happens if more than one cell is selected?
        const selectedCell = this.getSelectionCell();
        return (selectedCell.value as OrgPlannerChartVertex).orgEntity;
    }
    isEntitySelected(): boolean
    {
        return !this.isSelectionEmpty();
    }

    protected get rootCell(): Cell
    {
        if (!this._rootCell)
        {
            throw new Error("Root cell retrieved before it was set");
        }

        return this._rootCell;
    }

    private set rootCell(value: Cell)
    {
        this._rootCell = value;
    }

    protected isEmpty(): boolean
    {
        return (!this._rootCell);
    }

    initializemxGraph(): void
    {
        // Creates the outline (navigator, overview) for moving
        // around the graph in the top, right corner of the window.
        // var outline = document.getElementById('outlineContainer');
        // var outln = new mxOutline(this, outline);
    }

    public get graphTheme(): MaxGraphTheme
    {
        return this._graphTheme;
    }

    public set graphTheme(graphThemeToSet: MaxGraphTheme)
    {
        this._graphTheme = graphThemeToSet;

        this._orgChartMaxGraphBuilderService.applyTheme(this._graphTheme);

        this.refreshStyles();
    }

    /**
     * Returns the value to be used for the label.
     *
     * @param state <CellState> for which the label should be created.
     */
    getLabel = (cell: Cell):
        string => {
            let valueToReturn = "";

            if (cell.isVertex())
            {
                const cellValue = cell.value as OrgPlannerChartVertex;
                if (cellValue instanceof OrgPlannerChartEmployeeVertex)
                {
                    const employee = cellValue.employee;
                    valueToReturn +=
                        `<div data-testid="chart_cell_text_title_${employee.id}_testid">${employee.title}</div>`;

                    for (const nextProperty of employee.propertyIterator())
                    {
                        if (this.visibilityState.isVisible(nextProperty[0]))
                        {
                            let nextPropertyToDisplay = (nextProperty[1].length != 0) ? nextProperty[1] : "(unknown)";

                            valueToReturn += `<div data-testid="chart_cell_text_${nextProperty[0].name}-${
                                employee.id}_testid">${nextPropertyToDisplay}</div>`;
                        }
                    }

                    valueToReturn += `<div data-testid="chart_cell_text_team_${employee.id}_testid"><i>${
                        employee.team.title}</i></div>`;
                }
                else if (cellValue instanceof OrgPlannerChartTeamVertex)
                {
                    const team = cellValue.team;
                    valueToReturn = team.title;
                }
            }

            return valueToReturn;
        }

    renderGraph(): void
    {
        this._layout = new OrgPlannerChartLayout(this);
        // let layout = new CompactTreeLayout(this);
        const layoutMgr = new OrgPlannerChartLayoutManager(this, this._layout);

        // Disable layout events while populating
        layoutMgr.setEnabled(false);

        // Adds cells to the model in a single step
        this.batchUpdate(() => {
            this.populateGraph();
            const parent = this.getDefaultParent();

            // We shouldn't have to do this.  I think we're laying out twice, but if I don't do this, then the root
            // can't be found
            this._layout?.execute(parent);
        });

        layoutMgr.setEnabled(true);
    }

    rehydrate(): void
    {
        this.batchUpdate(() => {
            const parent = this.getDefaultParent();
            this.removeCells(this.getChildCells(parent, true, true), true);
            this.populateGraph();
        });
    }

    private refreshStyles()
    {
        // Need to traverse tree and apply new style.  FIXME - I don't think this is working
        this._layout?.traverse({
            vertex : this.rootCell,
            directed : true,
            func : (vertex: Cell) => {
                if (vertex.isVertex())
                {
                    this._orgChartMaxGraphBuilderService.updateStyle(vertex);

                    const cellState = this.view.getState(vertex, false);
                    if (cellState)
                    {
                        cellState.shape?.redraw();
                        if (cellState.text)
                        {
                            cellState.text.redraw();
                        }
                    }
                }
            },
            edge : null,
            visited : null
        });
    }

    addEmployee(employeeToAdd: Employee): void
    {
        this.batchUpdate(() => {
            let cellAdded;
            if (employeeToAdd.isManager())
            {
                cellAdded = this._orgChartMaxGraphBuilderService.addManagerNode(employeeToAdd);
            }
            else
            {
                cellAdded = this._orgChartMaxGraphBuilderService.addICNode(employeeToAdd);
            }

            // Expand the parent in case it is collapsed so the new cell shows
            const managerCell = this.model.getCell(employeeToAdd.managerId);
            if (managerCell != null)
            {
                // It hsould always be non-null

                this.showHideSubtree(managerCell, true);
            }
        });
    }

    requestUpdate(updatedOrgStructure?: OrgStructure, updatedColorTheme?: OrgEntityColorTheme,
                  updatedViewState?: OrgChartEntityVisibleState)
    {
        let needsRehydrate: boolean = false;
        let needsStyleUpdate: boolean = false;

        if (updatedViewState)
        {
            this.visibilityState = updatedViewState;
        }

        if (updatedColorTheme)
        {
            this.graphTheme = new OrgChartMaxGraphThemeBase(updatedColorTheme);

            // FIXME - Duplicate Code
            const graphStylesheet = this.getStylesheet();
            graphStylesheet.putCellStyle("manager", this.graphTheme.getStyleForNodeType("manager"));
            graphStylesheet.putCellStyle("ic", this.graphTheme.getStyleForNodeType("ic"));
            graphStylesheet.putCellStyle("team", this.graphTheme.getStyleForNodeType("team"));

            needsStyleUpdate = true;
        }

        if (updatedOrgStructure)
        {
            this.orgStructure = updatedOrgStructure;
            needsRehydrate = true;
        }

        if (needsRehydrate)
        {
            // This should automatically re-render the graph.  FIXME - I don't think this is working
            this.rehydrate();
        }
        else if (needsStyleUpdate)
        {
            this.refreshStyles();
        }
        else
        {
            // Need to manually re-render.  FIXME - This doesn't reduce the size of the shape
            this.refresh();
        }
    }

    private populateGraph(): void
    {
        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        // const parent = this.getDefaultParent();

        const visitor = new OrgChartBuildingVisitor(this._orgChartMaxGraphBuilderService);
        this.orgStructure.traverseBF(visitor);
        if (!visitor.rootCell)
        {
            throw new Error("Problem building graph. Root cell not found.");
        }
        this.rootCell = visitor.rootCell;
    }

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

    private traverse(chartVisitor: OrgPlannerChartVisitor, startCell: Cell): void
    {
        this.traverseImpl(chartVisitor, startCell, new Set<string>())
    }

    private traverseImpl(chartVisitor: OrgPlannerChartVisitor, cellToVisit: Cell, visited: Set<string>): void
    {
        const cellToVisitValue: OrgPlannerChartVertex = cellToVisit.value as OrgPlannerChartVertex;

        if (!visited.has(cellToVisitValue.orgEntity.id))
        {
            chartVisitor.visitEnter(cellToVisit);
            visited.add(cellToVisitValue.orgEntity.id);
            const edgeCount = cellToVisit.getEdgeCount();
            if (edgeCount > 0)
            {
                for (let i = 0; i < edgeCount; i += 1)
                {
                    const nextEdge = cellToVisit.getEdgeAt(i);
                    if (nextEdge.getTerminal(true) === cellToVisit)
                    {
                        const nextCellToVisit: Cell|null = nextEdge.getTerminal(false);
                        if (nextCellToVisit)
                        {
                            this.traverseImpl(chartVisitor, nextCellToVisit, visited);
                        }
                    }
                }
            }
            chartVisitor.visitLeave(cellToVisit);
        }
    }

    private showHideSubtree(cell: Cell, show: boolean): void
    {
        this.batchUpdate(() => {
            const cells: Cell[] = [];
            const savedGraph = this;

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

    private saveAsImage(): void
    {
        const a = document.createElement("a");
        const file = new Blob([ this.container.innerHTML ], {type : "image/svg+xml"});
        a.href = URL.createObjectURL(file);
        a.download = "orgPlan.svg";
        a.click();
    }

    onVisibilityUpdate(entity: ViewToggableEntity, isVisible: boolean)
    {
        // the label has changed, so resize all cells.  The resize will, in turn, redraw the cells
        this._layout?.traverse({
            vertex : this.rootCell,
            directed : true,
            func : (vertex: Cell) => {
                if (vertex.isVertex())
                {
                    this.cellSizeUpdated(vertex, false);
                }
            },
            edge : null,
            visited : null
        });
    }
}

export {OrgChartMaxGraph};
