import {
    Cell,
    CellOverlay,
    type CellStateStyle,
    constants,
    EventObject,
    Graph,
    ImageBox,
    InternalEvent
} from "@maxgraph/core";
import {BaseService, type Service, type ServiceConfiguration} from "@sphyrna/service-manager-ts";
import type {Employee, IndividualContributor, Manager, Team} from "orgplanner-common/model";

import {
    OrgPlannerChartEmployeeVertex,
    OrgPlannerChartICVertex,
    OrgPlannerChartManagerVertex,
    type OrgPlannerChartVertex,
    VertexType
} from "../orgPlannerChartModel";
import type {MaxGraphTheme} from "../themes/maxGraphTheme";

interface OrgChartMaxGraphAssemblyService extends Service
{
    insertGraph(graph: Graph): void;
    configureBaseOptions(): void;
    applyTheme(theme: MaxGraphTheme): void;
    updateStyle(vertex: Cell): void;
    createExpandOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void;
    createCollapseOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void;
    addExpandedOverlay(cell: Cell): unknown;
    addCollapsedOverlay(cell: Cell): unknown;
    addManagerNode(manager: Manager): Cell;
    addICNode(ic: IndividualContributor): Cell;
    addTeamNode(team: Team): Cell;
}

class OrgChartMaxGraphAssemblyServiceImpl extends BaseService implements OrgChartMaxGraphAssemblyService
{
    private _expandedOverlay?: CellOverlay;
    private _collapsedOverlay?: CellOverlay;
    private _graph?: Graph;

    insertGraph(graph: Graph): void
    {
        this._graph = graph;
    }

    createExpandOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void
    {
        const expandedImage = new ImageBox('resources/images/expanded.gif', 9, 9);
        this._expandedOverlay = new CellOverlay(expandedImage, 'Collapse', constants.ALIGN.CENTER);
        this._expandedOverlay.cursor = constants.CURSOR.TERMINAL_HANDLE;
        this._expandedOverlay.addListener(InternalEvent.CLICK, clickListener);
    }

    createCollapseOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void
    {
        const collapsedImage = new ImageBox('resources/images/collapsed.gif', 9, 9);
        this._collapsedOverlay = new CellOverlay(collapsedImage, 'Expand', constants.ALIGN.CENTER);
        this._collapsedOverlay.cursor = constants.CURSOR.TERMINAL_HANDLE;
        this._collapsedOverlay.addListener(InternalEvent.CLICK, clickListener);
    }

    addExpandedOverlay(managerCell: Cell): void
    {
        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        if (!this._expandedOverlay)
        {
            throw new Error("Expanded Overlay has not been created");
        }

        this._graph.addCellOverlay(managerCell, this._expandedOverlay);
    }

    addCollapsedOverlay(managerCell: Cell): void
    {
        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        if (!this._collapsedOverlay)
        {
            throw new Error("Collapsed Overlay has not been created");
        }

        this._graph.addCellOverlay(managerCell, this._collapsedOverlay);
    }

    init(configuration: ServiceConfiguration): void
    {
        // Do Nothing Implementation
    }

    configureBaseOptions(): void
    {
        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        this._graph.setAutoSizeCells(true);
        this._graph.autoSizeCellsOnAdd = true;
        this._graph.setHtmlLabels(true);
        this._graph.keepEdgesInBackground = true;

        // Can only have one edge between each node
        this._graph.multigraph = false;
    }

    applyTheme(theme: MaxGraphTheme): void
    {
        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        const graphStylesheet = this._graph.getStylesheet();

        // Creates the default style for vertices

        graphStylesheet.putCellStyle('manager', theme.getStyleForNodeType('manager'));
        graphStylesheet.putCellStyle('ic', theme.getStyleForNodeType('ic'));
        graphStylesheet.putCellStyle('team', theme.getStyleForNodeType('team'));

        // Creates the default style for edges
        graphStylesheet.putDefaultEdgeStyle(theme.getStyleForEdgeType('default'));

        // https://www.templatemonster.com/blog/pastel-color-schemes-for-refined-website-design/
        // https://coolors.co/bfe2ca-d0e2ec-424c55-d62839-ff7f11
    }

    updateStyle(vertex: Cell): void
    {
        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        const graphStylesheet = this._graph.getStylesheet();

        const newICStyle: CellStateStyle|undefined = graphStylesheet.styles.get('ic');
        const newManagerStyle: CellStateStyle|undefined = graphStylesheet.styles.get('manager');
        const newTeamStyle: CellStateStyle|undefined = graphStylesheet.styles.get('team');
        if (!newICStyle || !newManagerStyle || !newTeamStyle)
        {
            throw new Error("Style not found");
        }

        const cellState = this._graph.view.getState(vertex, false);
        if (cellState)
        {
            const cellValue: OrgPlannerChartVertex = vertex.value;
            if (cellValue.getVertexType() === VertexType.MANAGER)
            {
                cellState.style = newManagerStyle;
            }
            else if (cellValue.getVertexType() === VertexType.IC)
            {
                cellState.style = newICStyle;
            }
            else
            {
                cellState.style = newTeamStyle
            }

            cellState.shape?.apply(cellState);
            if (cellState.text)
            {
                cellState.text.apply(cellState);
            }
        }
    }

    addManagerNode(manager: Manager): Cell
    {
        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        const graphStylesheet = this._graph.getStylesheet();

        const orgChartManager = new OrgPlannerChartManagerVertex(manager);
        // FIX ME - Last Param
        return this._insertEmployeeNode(manager, orgChartManager, graphStylesheet.styles.get("manager")!);
    }

    addICNode(ic: IndividualContributor): Cell
    {
        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        const graphStylesheet = this._graph.getStylesheet();
        const orgChartEmployee = new OrgPlannerChartICVertex(ic);

        // FIX ME = Last param
        return this._insertEmployeeNode(ic, orgChartEmployee, graphStylesheet.styles.get('ic')!);
    }

    addTeamNode(): Cell
    {
        throw new Error("Method not implemented.");
    }

    private _insertEmployeeNode(employee: Employee, orgChartVertex: OrgPlannerChartEmployeeVertex,
                                cellStyleOverride: CellStateStyle): Cell
    {
        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        const parent = this._graph.getDefaultParent();
        const newCell =
            this._graph.insertVertex(parent, employee.id, orgChartVertex, 20, 20, 80, 30, cellStyleOverride);

        const managerCell = this._graph.model.getCell(employee.managerId);
        if (managerCell)
        {
            this._graph.insertEdge(parent, employee.managerId + employee.id, '', managerCell, newCell);
        }
        /*else
        {
            FIXME - The root manager doens't have a parent manager.  Therefore, this code which applies to all other
        cells doesn't work for the root.  Need a way to check for root, ideally throw new Error("Could not insert edge
        because manager was not found");
        }*/

        return newCell;
    }
}

export {OrgChartMaxGraphAssemblyServiceImpl};
export type {OrgChartMaxGraphAssemblyService};
