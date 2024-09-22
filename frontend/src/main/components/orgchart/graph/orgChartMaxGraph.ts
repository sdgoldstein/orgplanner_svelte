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
        if (employee.isManager())
        {
            const newManagerCell = this._orgChartMaxGraphBuilderService.addManagerNode(employee);
            this._orgChartMaxGraphBuilderService.addExpandedOverlay(newManagerCell);

            if (!this.rootCell)
            {
                // Root cell is the first manager created
                this.rootCell = newManagerCell;
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
            this._orgChartMaxGraphBuilderService.addICNode(employee);
        }
    }

    visitLeave(employee: Employee): void
    {
        // Do nothing
    }
}

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
        this._orgChartMaxGraphBuilderService.createExpandOverlay(
            (sender: EventTarget, event: EventObject) => { this.collapseSubtree(event.getProperty("cell") as Cell); });
        this._orgChartMaxGraphBuilderService.createCollapseOverlay(
            (sender: EventTarget, event: EventObject) => { this.expandSubtree(event.getProperty("cell") as Cell); });

        PubSubManager.instance.registerListener(OrgPlannerAppEvents.SAVE_AS_IMAGE, this);

        this.initializemxGraph(); // This is doing nothing in the base graph
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

    /*createCellRenderer(): CellRenderer
    {
        return new OrgChartCellRenderer(this._viewState);
    }*/

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
                            valueToReturn += `<div data-testid="chart_cell_text_${nextProperty[0].name}-${
                                employee.id}_testid">${nextProperty[1]}</div>`;
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
            if (employeeToAdd.isManager())
            {
                this._orgChartMaxGraphBuilderService.addManagerNode(employeeToAdd);
            }
            else
            {
                this._orgChartMaxGraphBuilderService.addICNode(employeeToAdd);
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

    private expandSubtree(cell: Cell): void
    {
        this.toggleSubtree(cell, true);
        this.clearCellOverlays(cell);
        this._orgChartMaxGraphBuilderService.addExpandedOverlay(cell);
    }

    private collapseSubtree(cell: Cell): void
    {
        this.toggleSubtree(cell, false);
        this.clearCellOverlays(cell);
        this._orgChartMaxGraphBuilderService.addCollapsedOverlay(cell)
    }

    private toggleSubtree(cell: Cell, show: boolean): void
    {
        this.batchUpdate(() => {
            const cells: Cell[] = [];
            const savedGraph = this;

            // FIX ME - Is there a more efficient way to do this?
            this._layout?.traverse({
                vertex : cell,
                directed : true,
                func : (vertex: Cell) => {
                    let valueToReturn = true;
                    if (vertex != cell)
                    {
                        cells.push(vertex);

                        // HACK - FIX ME - The only state we have to determine if the cell is expanded or not is the
                        // overlays
                        const overLays = savedGraph.getCellOverlays(vertex);

                        // If we're expanding and the vertex collapsed, don't expand it - FIXME
                        /*if ((overLays != null) && show && (overLays[0] == savedGraph._collapsedOverlay))
                        {
                            valueToReturn = false;
                        }*/
                    }
                    return valueToReturn;
                },
                edge : null,
                visited : null
            });

            this.toggleCells(show, cells, true);
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
