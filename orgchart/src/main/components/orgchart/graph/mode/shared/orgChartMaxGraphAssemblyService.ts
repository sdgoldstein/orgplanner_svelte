import type {Graph, Cell, EventObject} from "@maxgraph/core";
import type {Service} from "@sphyrna/service-manager-ts";
import type {Manager, IndividualContributor, Team, OrgEntity} from "orgplanner-common/model";
import type {MaxGraphTheme} from "../../common/themes/maxGraphTheme";
import type {OrgChartEntityVisibleState} from "../../../orgChartViewState";

interface OrgChartMaxGraphAssemblyService extends Service
{
    insertGraph(graph: Graph): void;
    configureBaseOptions(): void;
    applyTheme(theme: MaxGraphTheme): void;
    updateStyle(vertex: Cell): void;
    createToggleSubtreeOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void;
    createEditEmployeeButtonOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void;
    createDeleteEmployeeButtonOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void;
    createEditTeamButtonOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void;
    createDeleteTeamButtonOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void;
    addToggleSubtreeOverlay(cell: Cell): void;
    addEditEmployeeButtonOverlay(cell: Cell): void;
    addEditTeamButtonOverlay(cell: Cell): void;
    addDeleteEmployeeButtonOverlay(cell: Cell): void;
    addDeleteTeamButtonOverlay(cell: Cell): void;
    addManagerNode(manager: Manager): Cell;
    addICNode(ic: IndividualContributor): Cell;
    addTeamNode(team: Team): Cell;
    moveNode(movedEntity: OrgEntity, newParent: OrgEntity, previousParent: OrgEntity): void;
    augmentCellTemp(cell: Cell, visibilityState: OrgChartEntityVisibleState): void;
    // deleteOrgEntities(cellsToDelete: Cell[]): unknown;
}

export type{OrgChartMaxGraphAssemblyService};