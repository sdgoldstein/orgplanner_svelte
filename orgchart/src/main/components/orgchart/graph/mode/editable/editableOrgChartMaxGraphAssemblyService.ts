import type {Cell} from "@maxgraph/core";
import type {Manager, IndividualContributor, Team} from "orgplanner-common/model";
import type {OrgChartMaxGraphAssemblyService} from "../shared/orgChartMaxGraphAssemblyService";
import {OrgChartMaxGraphAssemblyServiceBase} from "../shared/orgChartMaxGraphAssemblyServiceBase";

class EditableOrgChartMaxGraphAssemblyService extends OrgChartMaxGraphAssemblyServiceBase implements
    OrgChartMaxGraphAssemblyService
{
    addManagerNode(manager: Manager): Cell
    {
        const cellToReturn = super.addManagerNode(manager);
        this.addToggleSubtreeOverlay(cellToReturn);
        this.addEditButtonOverlay(cellToReturn);
        this.addDeleteButtonOverlay(cellToReturn);

        return cellToReturn;
    }

    addICNode(ic: IndividualContributor): Cell
    {
        let cellToReturn = super.addICNode(ic);

        this.addEditButtonOverlay(cellToReturn);
        this.addDeleteButtonOverlay(cellToReturn);

        return cellToReturn;
    }

    addTeamNode(team: Team): Cell
    {
        let cellToReturn = super.addTeamNode(team);

        this.addToggleSubtreeOverlay(cellToReturn);
        this.addEditButtonOverlay(cellToReturn);
        this.addDeleteButtonOverlay(cellToReturn);

        // FIXME - This does not account for edges from children to their Teams

        return cellToReturn;
    }
}

export {EditableOrgChartMaxGraphAssemblyService};
