import type {Cell} from "@maxgraph/core";
import type {Manager, Team} from "orgplanner-common/model";
import type {OrgChartMaxGraphAssemblyService} from "../shared/orgChartMaxGraphAssemblyService";
import {OrgChartMaxGraphAssemblyServiceBase} from "../shared/orgChartMaxGraphAssemblyServiceBase";

class ReadOnlyOrgChartMaxGraphAssemblyService extends OrgChartMaxGraphAssemblyServiceBase implements
    OrgChartMaxGraphAssemblyService
{
    addManagerNode(manager: Manager): Cell
    {
        const cellToReturn = super.addManagerNode(manager);
        this.addToggleSubtreeOverlay(cellToReturn);

        return cellToReturn;
    }

    addTeamNode(team: Team): Cell
    {
        let cellToReturn = super.addTeamNode(team);

        this.addToggleSubtreeOverlay(cellToReturn);

        return cellToReturn;
    }
}

export {ReadOnlyOrgChartMaxGraphAssemblyService};
