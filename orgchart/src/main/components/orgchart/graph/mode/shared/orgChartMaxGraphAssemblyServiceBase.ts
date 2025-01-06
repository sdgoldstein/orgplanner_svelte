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
import type {OrgChartEntityVisibleState} from "@src/components/orgchart/graph/common/core/orgChartViewState";
import {
    type Manager,
    type IndividualContributor,
    type Team,
    OrgEntityTypes,
    type Employee,
    type OrgEntity,
    type OrgEntityType
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
    EditEmployeeButtonCellOverlay,
    DeleteEmployeeButtonCellOverlay,
    EditTeamButtonCellOverlay,
    DeleteTeamButtonCellOverlay
} from "../../common/themes/shape/orgChartCellOverlay";
import type {OrgChartMaxGraphAssemblyService} from "./orgChartMaxGraphAssemblyService";

class OrgChartMaxGraphAssemblyServiceBase extends BaseService implements OrgChartMaxGraphAssemblyService
{
    private _toggleSubtreeOverlay?: CellOverlay;
    private _editEmployeeButtonOverlay?: CellOverlay;
    private _deleteEmployeeButtonOverlay?: CellOverlay;
    private _editTeamButtonOverlay?: CellOverlay;
    private _deleteTeamButtonOverlay?: CellOverlay;

    private _graph?: Graph;

    insertGraph(graph: Graph): void
    {
        this._graph = graph;
    }

    protected get graph(): Graph
    {
        if (!this._graph)
        {
            throw new Error("Graph has not be inserted");
        }

        return this._graph;
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

        if (!this._toggleSubtreeOverlay)
        {
            throw new Error("Expanded Overlay has not been created");
        }

        this.graph.addCellOverlay(managerCell, this._toggleSubtreeOverlay);
    }

    createEditEmployeeButtonOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void
    {
        const transaprentImage = new ImageBox("transparent.png", 9, 9);
        // const transaprentImage = new ImageBox("square.png", 9, 9);
        this._editEmployeeButtonOverlay = new EditEmployeeButtonCellOverlay(
            transaprentImage, "Toggle", constants.ALIGN.RIGHT, constants.ALIGN.BOTTOM);
        this._editEmployeeButtonOverlay.cursor = constants.CURSOR.TERMINAL_HANDLE;
        this._editEmployeeButtonOverlay.addListener(InternalEvent.CLICK, clickListener);
    }

    addEditEmployeeButtonOverlay(cell: Cell): void
    {
        if (!this._editEmployeeButtonOverlay)
        {
            throw new Error("Expanded Overlay has not been created");
        }

        this.graph.addCellOverlay(cell, this._editEmployeeButtonOverlay);
    }

    createDeleteEmployeeButtonOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void
    {
        const transaprentImage = new ImageBox("transparent.png", 9, 9);
        // const transaprentImage = new ImageBox("square.png", 9, 9);
        this._deleteEmployeeButtonOverlay = new DeleteEmployeeButtonCellOverlay(
            transaprentImage, "Toggle", constants.ALIGN.RIGHT, constants.ALIGN.BOTTOM);
        this._deleteEmployeeButtonOverlay.cursor = constants.CURSOR.TERMINAL_HANDLE;
        this._deleteEmployeeButtonOverlay.addListener(InternalEvent.CLICK, clickListener);
    }

    addDeleteEmployeeButtonOverlay(cell: Cell): void
    {

        if (!this._deleteEmployeeButtonOverlay)
        {
            throw new Error("Expanded Overlay has not been created");
        }

        this.graph.addCellOverlay(cell, this._deleteEmployeeButtonOverlay);
    }

    createEditTeamButtonOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void
    {
        const transaprentImage = new ImageBox("transparent.png", 9, 9);
        // const transaprentImage = new ImageBox("square.png", 9, 9);
        this._editTeamButtonOverlay =
            new EditTeamButtonCellOverlay(transaprentImage, "Toggle", constants.ALIGN.RIGHT, constants.ALIGN.BOTTOM);
        this._editTeamButtonOverlay.cursor = constants.CURSOR.TERMINAL_HANDLE;
        this._editTeamButtonOverlay.addListener(InternalEvent.CLICK, clickListener);
    }

    addEditTeamButtonOverlay(cell: Cell): void
    {
        if (!this._editTeamButtonOverlay)
        {
            throw new Error("Expanded Overlay has not been created");
        }

        this.graph.addCellOverlay(cell, this._editTeamButtonOverlay);
    }

    createDeleteTeamButtonOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void
    {
        const transaprentImage = new ImageBox("transparent.png", 9, 9);
        // const transaprentImage = new ImageBox("square.png", 9, 9);
        this._deleteTeamButtonOverlay =
            new DeleteTeamButtonCellOverlay(transaprentImage, "Toggle", constants.ALIGN.RIGHT, constants.ALIGN.BOTTOM);
        this._deleteTeamButtonOverlay.cursor = constants.CURSOR.TERMINAL_HANDLE;
        this._deleteTeamButtonOverlay.addListener(InternalEvent.CLICK, clickListener);
    }

    addDeleteTeamButtonOverlay(cell: Cell): void
    {

        if (!this._deleteTeamButtonOverlay)
        {
            throw new Error("Expanded Overlay has not been created");
        }

        this.graph.addCellOverlay(cell, this._deleteTeamButtonOverlay);
    }

    init(configuration: ServiceConfiguration): void
    {
        // Do Nothing Implementation
    }

    configureBaseOptions(): void
    {

        this.graph.setAutoSizeCells(true);
        this.graph.autoSizeCellsOnAdd = true;
        this.graph.setHtmlLabels(true);
        this.graph.keepEdgesInBackground = true;

        // Can only have one edge between each node
        this.graph.multigraph = false;
    }

    applyTheme(theme: MaxGraphTheme): void
    {

        const graphStylesheet = this.graph.getStylesheet();

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

        const graphStylesheet = this.graph.getStylesheet();

        const newICStyle: CellStateStyle|undefined = graphStylesheet.styles.get("ic");
        const newManagerStyle: CellStateStyle|undefined = graphStylesheet.styles.get("manager");
        const newTeamStyle: CellStateStyle|undefined = graphStylesheet.styles.get("team");
        if (!newICStyle || !newManagerStyle || !newTeamStyle)
        {
            throw new Error("Style not found");
        }

        const cellState = this.graph.view.getState(vertex, false);
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

        const graphStylesheet = this.graph.getStylesheet();

        const orgChartManager = new OrgPlannerChartManagerVertex(manager);
        // FIX ME - Last Param
        cellToReturn = this._insertEmployeeNode(manager, orgChartManager, graphStylesheet.styles.get("manager")!);

        return cellToReturn;
    }

    addICNode(ic: IndividualContributor): Cell
    {
        let cellToReturn;

        const graphStylesheet = this.graph.getStylesheet();
        const orgChartEmployee = new OrgPlannerChartICVertex(ic);

        // FIX ME = Last param
        cellToReturn = this._insertEmployeeNode(ic, orgChartEmployee, graphStylesheet.styles.get("ic")!);

        return cellToReturn;
    }

    addTeamNode(team: Team): Cell
    {
        let cellToReturn;

        const graphStylesheet = this.graph.getStylesheet();

        const orgChartVertex = new OrgPlannerChartTeamVertex(team);

        const parent = this.graph.getDefaultParent();
        cellToReturn = this.graph.insertVertex(parent, team.id, orgChartVertex, 20, 20, 80, 30,
                                               graphStylesheet.styles.get("team")!);

        // Create edge from manager to team
        const managerCell = this.graph.model.getCell(team.managerId);
        if (managerCell)
        {
            this._insertOrgEntityToOrgEntityEdge(managerCell, cellToReturn);

            // Create edge from teams their manager's team.  This enables removing managers from the chart
            const parentTeamCell = this.graph.model.getCell(managerCell.value.orgEntity.team.id);
            if (parentTeamCell)
            {
                this._insertOrgEntityToOrgEntityEdge(parentTeamCell, cellToReturn);
            }
        }

        return cellToReturn;
    }

    moveNode(movedEntity: OrgEntity, newParent: OrgEntity, previousParent: OrgEntity): void
    {
        const movedCell = this.graph.model.getCell(movedEntity.id);
        if (movedCell === null)
        {
            throw new Error(`Could not find cell by id, ${movedEntity.id}`);
        }

        // Replace value just in case it has changed
        // WRONG!!!! Need Vertex
        switch (movedEntity.orgEntityType)
        {
        case OrgEntityTypes.MANAGER:
            movedCell.value = new OrgPlannerChartManagerVertex(movedEntity as Employee);
            break;
        case OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR:
            movedCell.value = new OrgPlannerChartICVertex(movedEntity as Employee);
            break;
        case OrgEntityTypes.TEAM:
            movedCell.value = new OrgPlannerChartTeamVertex(movedEntity as Team);
            break;
        default:
            throw new Error(`Unexpected org entity type: ${movedEntity.orgEntityType}`);
        }

        const newParentCell = this.graph.model.getCell(newParent.id);
        if (newParentCell === null)
        {
            throw new Error(`Could not find new parent cell by id, ${newParent.id}`);
        }

        const previousParentCell = this.graph.model.getCell(previousParent.id);
        if (previousParentCell === null)
        {
            throw new Error(`Could not find new parent cell by id, ${previousParent.id}`);
        }

        // Remove edge from previous parent to cell
        // Add edge from new parent to cell
        /*
        Scenarios:
        1.  IC moves to new Manager
        2.  Manager moves to new Manaager
        3.  IC move to new Team
        4.  Manager move to new Team
        5.  Team moves to new Manager
        */
        const incomingEdgesForMovedEntity: Cell[] = movedCell.getIncomingEdges();
        for (let nextIncomingEdgeForMovedEntity of incomingEdgesForMovedEntity)
        {
            if (nextIncomingEdgeForMovedEntity.source === previousParentCell)
            {
                this.graph.removeCells([ nextIncomingEdgeForMovedEntity ]);
                this._insertOrgEntityToOrgEntityEdge(newParentCell, movedCell);
            }
            else if (movedEntity.orgEntityType === OrgEntityTypes.TEAM)
            {
                if ((nextIncomingEdgeForMovedEntity.source !== null) &&
                    (nextIncomingEdgeForMovedEntity.source.value.orgEntityType === OrgEntityTypes.TEAM))
                {
                    this.graph.removeCells([ nextIncomingEdgeForMovedEntity ]);
                    // Create edge from teams their manager's team.  This enables removing managers from the chart
                    const parentTeamCell = this.graph.model.getCell(newParentCell.value.orgEntity.team.id);
                    if (parentTeamCell)
                    {
                        this._insertOrgEntityToOrgEntityEdge(movedCell, parentTeamCell);
                    }
                }
                else
                {
                    throw new Error(`Unexpect edge with parent type, ${
                        nextIncomingEdgeForMovedEntity.source?.value.orgEntityType}, and child ${
                        movedEntity.orgEntityType}`);
                }
            }
        }
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
        const parent = this.graph.getDefaultParent();
        const newCell = this.graph.insertVertex(parent, employee.id, orgChartVertex, 20, 20, 80, 30, cellStyleOverride);

        // Create edge from manager to employee
        const managerCell = this.graph.model.getCell(employee.managerId);
        if (managerCell)
        {
            this._insertOrgEntityToOrgEntityEdge(managerCell, newCell);
        }

        // Create edge from teams to employee
        const teamCell = this.graph.model.getCell(employee.team.id);
        if (teamCell)
        {
            this._insertOrgEntityToOrgEntityEdge(teamCell, newCell);
        }

        /*else
        {
            FIXME - The root manager doens't have a parent manager.  Therefore, this code which applies to all other
        cells doesn't work for the root.  Need a way to check for root, ideally throw new Error("Could not insert edge
        because manager was not found");
        }*/

        return newCell;
    }

    private _insertOrgEntityToOrgEntityEdge(parentEntityCell: Cell, childEntityCell: Cell)
    {
        const parent = this.graph.getDefaultParent();
        const insertedEdge = this.graph.insertEdge(
            parent, `${parentEntityCell.value.orgEntity.id}-${childEntityCell.value.orgEntity.id}`, "",
            parentEntityCell, childEntityCell);
        this._augmentEdgeTemp(insertedEdge);
    }

    private _augmentEdgeTemp(insertedEdge: Cell)
    {
        /*
         *  This is overly complicated.  Wish we had a better way to do this.  An edge is visible if all of the
         * following are true:
         *  - The underlying isVisible function returns true
         *  - The source vertex and target vertices are both visible
         *  -   The target only has one incoming edge
         *      OR
         *  -   The target only has multiple incomong edges, but only one source is visible
         *      OR
         *  -   The target has multiple incoming edges, and the source is Team, the target is an employee and the team's
         * manager is the same as the employee manager
         *      OR
         *  -   The target has multiple incoming edges, and the source is a Manager, the target is an employee and the
         * employee's team's manager is not the source
         *      OR
         *  -   The target has multiple incoming edges, and the source is a Manager and the target is an Team
         */
        insertedEdge.isVisibleOriginal = insertedEdge.isVisible;
        insertedEdge.isVisible = () => {
            let visibilityToReturn = false;

            const edgeTarget = insertedEdge.target;
            const edgeSource = insertedEdge.source;
            if ((edgeTarget !== null && edgeTarget.isVisible()) && (edgeSource !== null && edgeSource.isVisible()))
            {
                const targetEdges: Cell[] = edgeTarget.getEdges(true, false);
                if (targetEdges.length === 1)
                {
                    visibilityToReturn = true;
                }
                else if (targetEdges.length > 1)
                {
                    let numVisibleSources = 0;
                    for (const nextEdge of targetEdges)
                    {
                        if (nextEdge.source !== null && nextEdge.source.isVisible())
                        {
                            numVisibleSources++;
                        }
                    }

                    if (numVisibleSources === 1)
                    {
                        // The target has multiple incoming edges, but only one sources is visible.  It could be a team
                        // or a manager, doesn't matter
                        visibilityToReturn = true;
                    }
                    else if (numVisibleSources > 1)
                    {
                        // The target has multiple incoming edges, and the source is Team, the target is an employee and
                        // the team's manager is the same as the employee manager
                        //   -   OR
                        //   The target has multiple incoming edges, and the source is a Manager, the target is an
                        //   employee and the employee's team's manager is not the source
                        //   -   OR
                        //   The target has multiple incoming edges, and the source is a Manager and the target is
                        //   an Team
                        const targetEntity: OrgEntity = edgeTarget.getValue().orgEntity;
                        const sourceEntity: OrgEntity = edgeSource.getValue().orgEntity;
                        const targetEntityType: OrgEntityType = targetEntity.orgEntityType;
                        const sourceEntityType: OrgEntityType = sourceEntity.orgEntityType;
                        visibilityToReturn =
                            (((sourceEntityType === OrgEntityTypes.TEAM) &&
                              (targetEntityType !== OrgEntityTypes.TEAM) &&
                              ((targetEntity as Employee).managerId == (sourceEntity as Team).managerId)) ||
                             ((sourceEntityType === OrgEntityTypes.MANAGER) &&
                              (targetEntityType !== OrgEntityTypes.TEAM) &&
                              ((targetEntity as Employee).team.managerId != (sourceEntity as Manager).id)) ||
                             ((sourceEntityType === OrgEntityTypes.MANAGER) &&
                              (targetEntityType === OrgEntityTypes.TEAM)));
                    }
                }
                else
                {
                    throw new Error("Target has no target edges.  Inconsistent state");
                }
            }

            // Don't forget to check th eunderlying edge visibility
            visibilityToReturn &&= insertedEdge.isVisibleOriginal();

            return visibilityToReturn
        }
    }
}

export {OrgChartMaxGraphAssemblyServiceBase};
