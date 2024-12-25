import type {Graph, Cell, EventObject} from "@maxgraph/core";
import type {Service} from "@sphyrna/service-manager-ts";
import type {Manager, IndividualContributor, Team} from "orgplanner-common/model";
import type {MaxGraphTheme} from "../../common/themes/maxGraphTheme";
import type {OrgChartEntityVisibleState} from "../../../orgChartViewState";

interface OrgChartMaxGraphAssemblyService extends Service
{
    insertGraph(graph: Graph): void;
    configureBaseOptions(): void;
    applyTheme(theme: MaxGraphTheme): void;
    updateStyle(vertex: Cell): void;
    createToggleSubtreeOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void;
    createEditButtonOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void;
    createDeleteButtonOverlay(clickListener: (sender: EventTarget, event: EventObject) => void): void;
    addToggleSubtreeOverlay(cell: Cell): void;
    addEditButtonOverlay(cell: Cell): void;
    addManagerNode(manager: Manager): Cell;
    addICNode(ic: IndividualContributor): Cell;
    addTeamNode(team: Team): Cell;
    augmentCellTemp(cell: Cell, visibilityState: OrgChartEntityVisibleState): void;
    // deleteOrgEntities(cellsToDelete: Cell[]): unknown;
}

export type{OrgChartMaxGraphAssemblyService};