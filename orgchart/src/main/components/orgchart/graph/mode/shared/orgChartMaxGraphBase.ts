import {
    Cell,
    EventObject,
    getDefaultPlugins,
    Graph,
    GraphLayout,
    LayoutManager,
    SelectionHandler,
    type GraphPluginConstructor
} from "@maxgraph/core";

import type {PubSubListener, PubSubEvent} from "orgplanner-common/jscore";
import {
    type OrgStructureVisitor,
    type Employee,
    type OrgStructure,
    type OrgEntityColorTheme,
    type Team,
    type OrgEntity
} from "orgplanner-common/model";
import {
    FixedOrgEntityPropertyDescriptors,
    type OrgChartEntityVisibleState,
    type ViewToggableEntity
} from "../../common/core/orgChartViewState";
import {
    OrgPlannerChartModel,
    type OrgPlannerChartVertex,
    OrgPlannerChartEmployeeVertex,
    OrgPlannerChartTeamVertex
} from "../../common/core/orgPlannerChartModel";
import {OrgPlannerChartLayout} from "../../common/layout/orgPlannerChartLayout";
import type {MaxGraphTheme} from "../../common/themes/maxGraphTheme";
import {OrgChartMaxGraphThemeDefault} from "../../common/themes/orgChartMaxGraphThemeDefault";
import type {OrgChartMaxGraph} from "../../common/core/orgChartMaxGraph";
import type {OrgChartMaxGraphAssemblyService} from "./orgChartMaxGraphAssemblyService";
import type {EntityViewToggableOrgChartMaxGraph} from "./viewToggableEntityEventHandler";

// FIXME - Prefer composition to inheritance?  The entire mode design is based on inheritance - is there a way to make
// it use composition instead with decorators to incerease sharing nad make it more flexible?  Difficult due to the
// functional nature of the MaxGraph library?
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
    constructor(private _orgStructure: OrgStructure,
                private _orgChartMaxGraphBuilderService: OrgChartMaxGraphAssemblyService,
                private _visibilityState: OrgChartEntityVisibleState)
    {
    }

    visitEnter(employee: Employee): void
    {
        let newCell: Cell;

        if (employee.isManager())
        {
            newCell = this._orgChartMaxGraphBuilderService.addManagerNode(employee);

            // Add all teams that this manager manages
            if (this._orgStructure.managerHasTeams(employee))
            {
                let teamsForManager: Team[] = this._orgStructure.getTeamsForManager(employee);
                teamsForManager.forEach((team: Team) => {
                    const teamCellAdded = this._orgChartMaxGraphBuilderService.addTeamNode(team);
                    this._orgChartMaxGraphBuilderService.augmentCellTemp(teamCellAdded, this._visibilityState);
                });
            }
        }
        else
        {
            newCell = this._orgChartMaxGraphBuilderService.addICNode(employee);
        }

        this._orgChartMaxGraphBuilderService.augmentCellTemp(newCell, this._visibilityState);
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
abstract class OrgChartMaxGraphBase extends Graph implements OrgChartMaxGraph, PubSubListener,
                                                             EntityViewToggableOrgChartMaxGraph
{
    // @ts-ignore: _isUpdating is declared but its value is never read - FIXME
    private _isUpdating: boolean = false;

    private _rootCell?: Cell;
    private _layout?: OrgPlannerChartLayout;

    constructor(_element: HTMLElement, private _orgStructure: OrgStructure, private _graphTheme: MaxGraphTheme,
                protected visibilityState: OrgChartEntityVisibleState,
                protected readonly orgChartMaxGraphAssemblyService: OrgChartMaxGraphAssemblyService,
                pluginOverrides: GraphPluginConstructor[] = [])
    {
        super(_element, new OrgPlannerChartModel(visibilityState),
              OrgChartMaxGraphBase._mergeWithDefaultPlugins(pluginOverrides));

        // FIXME - Need a mechanism to register services that the app does not know about, but are part of dependent
        // libraries
        //       ServiceManager.getService(OrgPlannerAppServicesConstants.ORG_CHART_MAX_GRAPH_ASSEMBLY_SERVICE) as
        //           OrgChartMaxGraphAssemblyService;

        this.setup(this.orgChartMaxGraphAssemblyService);
    }

    private static _mergeWithDefaultPlugins(pluginOverrides: GraphPluginConstructor[]): GraphPluginConstructor[]
    {
        const pluginsToReturn = getDefaultPlugins();

        pluginOverrides.forEach(nextPluginOverride => {
            const index = pluginsToReturn.findIndex((nextDefaultPlugin: GraphPluginConstructor) =>
                                                        (nextDefaultPlugin.pluginId === nextPluginOverride.pluginId));
            if (index !== -1)
            {
                pluginsToReturn[index] = nextPluginOverride;
            }
        });

        return pluginsToReturn;
    }

    protected setup(assemblyService: OrgChartMaxGraphAssemblyService): void
    {
        assemblyService.insertGraph(this);
        assemblyService.configureBaseOptions();
        assemblyService.applyTheme(this._graphTheme);

        assemblyService.createToggleSubtreeOverlay(
            (sender: EventTarget, event: EventObject) => { this.toggleSubtree(event.getProperty("cell") as Cell); });
    }

    protected traverse(chartVisitor: OrgPlannerChartVisitor, startCell: Cell): void
    {
        this.traverseImpl(chartVisitor, startCell, new Set<string>())
    }

    protected traverseImpl(chartVisitor: OrgPlannerChartVisitor, cellToVisit: Cell, visited: Set<string>): void
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

    /**
     * FIXME - Can we avoid this!
     */
    protected rehydrate(): void
    {
        //  Need to do this in two passes.  First, remove all cells, then re-add them.  Otherwise, they're not removed
        //  when repopulating the graph, leading to duplicates and issues
        this.batchUpdate(() => { this.getDataModel().clear(); });

        this.batchUpdate(() => { this.populateGraph(); });
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
            // FIXME This might NOT be the right theme
            this.graphTheme = new OrgChartMaxGraphThemeDefault(updatedColorTheme);

            // FIXME - Duplicate Code
            const graphStylesheet = this.getStylesheet();
            graphStylesheet.putCellStyle("manager", this.graphTheme.getStyleForNodeType("manager"));
            graphStylesheet.putCellStyle("ic", this.graphTheme.getStyleForNodeType("ic"));
            graphStylesheet.putCellStyle("team", this.graphTheme.getStyleForNodeType("team"));

            needsStyleUpdate = true;
        }

        if (updatedOrgStructure)
        {
            this._orgStructure = updatedOrgStructure;
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

    public get graphTheme(): MaxGraphTheme
    {
        return this._graphTheme;
    }

    public set graphTheme(graphThemeToSet: MaxGraphTheme)
    {
        this._graphTheme = graphThemeToSet;

        this.orgChartMaxGraphAssemblyService.applyTheme(this._graphTheme);

        this.refreshStyles();
    }

    public renderGraph(): void
    {
        this._layout = new OrgPlannerChartLayout(this, () => {
            let valueToReturn = this.model.getCell(this._orgStructure.rootTeam.id);
            if ((valueToReturn === null) || !valueToReturn.isVisible())
            {
                valueToReturn = this.model.getCell(this._orgStructure.orgLeader.id);
            }
            return valueToReturn;
        });

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

    /* Overriden */
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

    /**
     * // FIXME Verify that this is being used and that it's in the right place
     *
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

                    if (this.visibilityState.isVisible(FixedOrgEntityPropertyDescriptors.TITLE))
                    {
                        valueToReturn +=
                            `<div data-testid="chart_cell_text_title_${employee.id}_testid">${employee.title}</div>`;
                    }

                    for (const nextProperty of employee.propertyDescriptorIterator())
                    {
                        if (this.visibilityState.isVisible(nextProperty) && nextProperty.enabled)
                        {
                            let nextPropertyToDisplay = employee.getPropertyValue(nextProperty.name);
                            if (nextPropertyToDisplay.length === 0)
                            {
                                nextPropertyToDisplay = "(unknown)";
                            }
                            valueToReturn += `<div data-testid="chart_cell_text_${nextProperty.name}-${
                                employee.id}_testid">${nextPropertyToDisplay}</div>`;
                        }
                    }

                    if (this.visibilityState.isVisible(FixedOrgEntityPropertyDescriptors.TEAM_TITLE))
                    {
                        valueToReturn += `<div data-testid="chart_cell_text_team_${employee.id}_testid"><i>${
                            employee.team.title}</i></div>`;
                    }
                }
                else if (cellValue instanceof OrgPlannerChartTeamVertex)
                {
                    const team = cellValue.team;
                    valueToReturn = team.title;
                }
            }

            return valueToReturn;
        }

    onEvent(eventName: string, eventToHandle: PubSubEvent): void
    {
        throw new Error("Method not implemented.");
    }

    onVisibilityUpdate(entity: ViewToggableEntity, isVisible: boolean)
    {
        this.visibilityState.setVisible(entity, isVisible);

        // FIXME - Do we have to rehydrate for every visibility change?  It's expensive
        this.rehydrate();

        // the label has changed, so resize all cells.  The resize will, in turn, redraw the cells
        /*this._layout?.traverse({
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
        });*/
    }

    private populateGraph(): void
    {
        // First, add the root team
        const rootTeamCellAdded = this.orgChartMaxGraphAssemblyService.addTeamNode(this._orgStructure.rootTeam);
        this.orgChartMaxGraphAssemblyService.augmentCellTemp(rootTeamCellAdded, this.visibilityState);

        // The root team is the root cell
        this.rootCell = rootTeamCellAdded;

        // Traverse the org structure and to add Employee Nodes
        const visitor =
            new OrgChartBuildingVisitor(this._orgStructure, this.orgChartMaxGraphAssemblyService, this.visibilityState);
        this._orgStructure.traverseBF(visitor);
        /*if (!visitor.rootCell)
        {
            throw new Error("Problem building graph. Root cell not found.");
        }
        this.rootCell = visitor.rootCell;
*/
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
                    this.orgChartMaxGraphAssemblyService.updateStyle(vertex);

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

    protected showHideSubtree(cell: Cell, show: boolean): void
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

    getSelectedEntities(): OrgEntity[]
    {
        const selectedEntitiesToReturn: OrgEntity[] = [];

        const selectedCell = this.getSelectionCells();
        for (const nextCell of selectedCell)
        {
            selectedEntitiesToReturn.push((nextCell.value as OrgPlannerChartVertex).orgEntity);
        }
        return selectedEntitiesToReturn;
    }

    /********************
     * Old Methods which are no longer used?
     * *********************/
    /*
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

     protected isEmpty(): boolean
     {
        return (!this._rootCell);
     }
    */
}

export {OrgChartMaxGraphBase, OrgPlannerChartVisitor, OrgPlannerChartLayoutManager, OrgChartBuildingVisitor};
