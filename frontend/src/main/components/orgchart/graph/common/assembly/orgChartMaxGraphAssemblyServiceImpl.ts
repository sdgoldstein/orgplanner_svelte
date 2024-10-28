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
import {BaseService, type ServiceConfiguration} from "@sphyrna/service-manager-ts";
import type {Employee, IndividualContributor, Manager} from "orgplanner-common/model";

import {
    OrgPlannerChartEmployeeVertex,
    OrgPlannerChartICVertex,
    OrgPlannerChartManagerVertex,
    type OrgPlannerChartVertex,
    VertexType
} from "../core/orgPlannerChartModel";
import type {MaxGraphTheme} from "../themes/maxGraphTheme";
import {
    DefaultOrgChartCellOverlay,
    DeleteButtonCellOverlay,
    EditButtonCellOverlay
} from "../themes/shape/orgChartCellOverlay";
import type {OrgChartMaxGraphAssemblyService} from "../../model/orgChartMaxGraphAssemblyService";

class OrgChartMaxGraphAssemblyServiceImpl extends BaseService implements OrgChartMaxGraphAssemblyService
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
        let cellToReturn;

        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        const graphStylesheet = this._graph.getStylesheet();

        const orgChartManager = new OrgPlannerChartManagerVertex(manager);
        // FIX ME - Last Param
        cellToReturn = this._insertEmployeeNode(manager, orgChartManager, graphStylesheet.styles.get("manager")!);
        this.addToggleSubtreeOverlay(cellToReturn);
        this.addEditButtonOverlay(cellToReturn);
        this.addDeleteButtonOverlay(cellToReturn);

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
        this.addToggleSubtreeOverlay(cellToReturn);
        this.addEditButtonOverlay(cellToReturn);
        this.addDeleteButtonOverlay(cellToReturn);

        return cellToReturn;
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
            this._graph.insertEdge(parent, employee.managerId + employee.id, "", managerCell, newCell);
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
