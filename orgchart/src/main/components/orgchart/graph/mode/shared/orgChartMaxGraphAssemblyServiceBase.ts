import {
    constants,
    InternalEvent,
    type CellOverlay,
    type Graph,
    type EventObject,
    ImageBox,
    type Cell,
    type CellStateStyle
} from "@maxgraph/core";
import {BaseService, type ServiceConfiguration} from "@sphyrna/service-manager-ts";
import type {OrgChartEntityVisibleState} from "@src/components/orgchart/orgChartViewState";
import {
    type Manager,
    type IndividualContributor,
    type Team,
    OrgEntityTypes,
    type Employee
} from "orgplanner-common/model";
import {
    type OrgPlannerChartVertex,
    VertexType,
    OrgPlannerChartManagerVertex,
    OrgPlannerChartICVertex,
    OrgPlannerChartTeamVertex,
    OrgPlannerChartEmployeeVertex
} from "../../common/core/orgPlannerChartModel";
import type {MaxGraphTheme} from "../../common/themes/maxGraphTheme";
import {
    DefaultOrgChartCellOverlay,
    EditButtonCellOverlay,
    DeleteButtonCellOverlay
} from "../../common/themes/shape/orgChartCellOverlay";
import type {OrgChartMaxGraphAssemblyService} from "../../model/orgChartMaxGraphAssemblyService";

class OrgChartMaxGraphAssemblyServiceBase extends BaseService implements OrgChartMaxGraphAssemblyService
{
    private _toggleSubtreeOverlay?: CellOverlay;
    private _editButtonOverlay?: CellOverlay;
    private _deleteButtonOverlay?: CellOverlay

        private _graph?: Graph;

    insertGraph(graph: Graph): void
    {
        this._graph = graph;
    }

    createToggleSubtreeOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void
    {
        const transaprentImage = new ImageBox("transparent.png", 9, 9);
        // const transaprentImage = new ImageBox("square.png", 9, 9);
        this._toggleSubtreeOverlay = new DefaultOrgChartCellOverlay("toggleSubtree", transaprentImage, "Toggle",
                                                                    constants.ALIGN.CENTER, constants.ALIGN.BOTTOM);
        this._toggleSubtreeOverlay.cursor = constants.CURSOR.TERMINAL_HANDLE;
        this._toggleSubtreeOverlay.addListener(InternalEvent.CLICK, clickListener);
    }

    addToggleSubtreeOverlay(managerCell: Cell): void
    {
        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        if (!this._toggleSubtreeOverlay)
        {
            throw new Error("Expanded Overlay has not been created");
        }

        this._graph.addCellOverlay(managerCell, this._toggleSubtreeOverlay);
    }

    createEditButtonOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void
    {
        const transaprentImage = new ImageBox("transparent.png", 9, 9);
        // const transaprentImage = new ImageBox("square.png", 9, 9);
        this._editButtonOverlay =
            new EditButtonCellOverlay(transaprentImage, "Toggle", constants.ALIGN.RIGHT, constants.ALIGN.BOTTOM);
        this._editButtonOverlay.cursor = constants.CURSOR.TERMINAL_HANDLE;
        this._editButtonOverlay.addListener(InternalEvent.CLICK, clickListener);
    }

    addEditButtonOverlay(cell: Cell): void
    {
        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        if (!this._editButtonOverlay)
        {
            throw new Error("Expanded Overlay has not been created");
        }

        this._graph.addCellOverlay(cell, this._editButtonOverlay);
    }

    createDeleteButtonOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void
    {
        const transaprentImage = new ImageBox("transparent.png", 9, 9);
        // const transaprentImage = new ImageBox("square.png", 9, 9);
        this._deleteButtonOverlay =
            new DeleteButtonCellOverlay(transaprentImage, "Toggle", constants.ALIGN.RIGHT, constants.ALIGN.BOTTOM);
        this._deleteButtonOverlay.cursor = constants.CURSOR.TERMINAL_HANDLE;
        this._deleteButtonOverlay.addListener(InternalEvent.CLICK, clickListener);
    }

    addDeleteButtonOverlay(cell: Cell): void
    {
        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        if (!this._deleteButtonOverlay)
        {
            throw new Error("Expanded Overlay has not been created");
        }

        this._graph.addCellOverlay(cell, this._deleteButtonOverlay);
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

        graphStylesheet.putCellStyle("manager", theme.getStyleForNodeType("manager"));
        graphStylesheet.putCellStyle("ic", theme.getStyleForNodeType("ic"));
        graphStylesheet.putCellStyle("team", theme.getStyleForNodeType("team"));

        // Creates the default style for edges
        graphStylesheet.putDefaultEdgeStyle(theme.getStyleForEdgeType("default"));

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

        const newICStyle: CellStateStyle|undefined = graphStylesheet.styles.get("ic");
        const newManagerStyle: CellStateStyle|undefined = graphStylesheet.styles.get("manager");
        const newTeamStyle: CellStateStyle|undefined = graphStylesheet.styles.get("team");
        if (!newICStyle || !newManagerStyle || !newTeamStyle)
        {
            throw new Error("Style not found");
        }

        const cellState = this._graph.view.getState(vertex, false);
        if (cellState)
        {
            const cellValue: OrgPlannerChartVertex = vertex.value;

            // Why vertex.style and cellState.style both need to be set is unclear
            if (cellValue.getVertexType() === VertexType.MANAGER)
            {
                vertex.style = newManagerStyle;
                cellState.style = newManagerStyle;
            }
            else if (cellValue.getVertexType() === VertexType.IC)
            {
                vertex.style = newICStyle;
                cellState.style = newICStyle;
            }
            else
            {
                vertex.style = newTeamStyle;
                cellState.style = newTeamStyle;
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
        let cellToReturn;

        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        const graphStylesheet = this._graph.getStylesheet();

        const orgChartManager = new OrgPlannerChartManagerVertex(manager);
        // FIX ME - Last Param
        cellToReturn = this._insertEmployeeNode(manager, orgChartManager, graphStylesheet.styles.get("manager")!);

        return cellToReturn;
    }

    addICNode(ic: IndividualContributor): Cell
    {
        let cellToReturn;

        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        const graphStylesheet = this._graph.getStylesheet();
        const orgChartEmployee = new OrgPlannerChartICVertex(ic);

        // FIX ME = Last param
        cellToReturn = this._insertEmployeeNode(ic, orgChartEmployee, graphStylesheet.styles.get("ic")!);

        return cellToReturn;
    }

    addTeamNode(team: Team): Cell
    {
        let cellToReturn;

        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        const graphStylesheet = this._graph.getStylesheet();

        const orgChartVertex = new OrgPlannerChartTeamVertex(team);

        const parent = this._graph.getDefaultParent();
        cellToReturn = this._graph.insertVertex(parent, team.id, orgChartVertex, 20, 20, 80, 30,
                                                graphStylesheet.styles.get("team")!);

        // Create edge from manager to team
        const managerCell = this._graph.model.getCell(team.managerId);
        if (managerCell)
        {
            const insertedEdge =
                this._graph.insertEdge(parent, team.managerId + team.id, "", managerCell, cellToReturn);
            this._augmentEdgeTemp(insertedEdge);
        }

        // FIXME - This does not account for edges from children to their Teams

        return cellToReturn;
    }

    augmentCellTemp(cell: Cell, visibilityState: OrgChartEntityVisibleState): void
    {
        const isVisibleOriginal = cell.isVisible;
        cell.isVisibleOriginal = isVisibleOriginal;

        cell.isVisible = () => {
            let visibilityToReturn = false;

            const cellValue = cell.getValue();
            if (cellValue)
            {
                const cellOrgEntityType = cellValue.orgEntity.orgEntityType
                visibilityToReturn = visibilityState.isVisible(cellOrgEntityType) && cell.isVisibleOriginal();

                if (cellOrgEntityType === OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR)
                {
                    visibilityToReturn &&= (visibilityState.isVisible(OrgEntityTypes.MANAGER) ||
                                            visibilityState.isVisible(OrgEntityTypes.TEAM));
                }
            }

            return visibilityToReturn;
        }
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

        // Create edge from manager to employee
        const managerCell = this._graph.model.getCell(employee.managerId);
        if (managerCell)
        {
            const insertedEdge =
                this._graph.insertEdge(parent, employee.managerId + employee.id, "", managerCell, newCell);
            this._augmentEdgeTemp(insertedEdge);
        }

        // Create edge from teams to employee
        const teamCell = this._graph.model.getCell(employee.team.id);
        if (teamCell)
        {
            const insertedEdge = this._graph.insertEdge(parent, employee.team.id + employee.id, "", teamCell, newCell);
            this._augmentEdgeTemp(insertedEdge);
        }

        /*else
        {
            FIXME - The root manager doens't have a parent manager.  Therefore, this code which applies to all other
        cells doesn't work for the root.  Need a way to check for root, ideally throw new Error("Could not insert edge
        because manager was not found");
        }*/

        return newCell;
    }

    private _augmentEdgeTemp(insertedEdge: Cell)
    {
        insertedEdge.isVisibleOriginal = insertedEdge.isVisible;
        insertedEdge.isVisible = () => {
            return (insertedEdge.source === null || insertedEdge.source.isVisible()) &&
                   (insertedEdge.target === null || insertedEdge.target.isVisible()) &&
                   insertedEdge.isVisibleOriginal();
        }
    }
}

export {OrgChartMaxGraphAssemblyServiceBase};
