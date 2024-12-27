import type {Cell} from "@maxgraph/core";
import type {Manager, IndividualContributor, Team} from "orgplanner-common/model";
import type {OrgChartMaxGraphAssemblyService} from "../shared/orgChartMaxGraphAssemblyService";
import {OrgChartMaxGraphAssemblyServiceBase} from "../shared/orgChartMaxGraphAssemblyServiceBase";

// FIXME - There should be one assembly service like a builder.  That enables consistency across the graphs.  The
// details of how things are built should be handled in the graph subclasses.  Therefore, sublasses of assembly servie
// shold not be needed.  (I think!)
class EditableOrgChartMaxGraphAssemblyService extends OrgChartMaxGraphAssemblyServiceBase implements
    OrgChartMaxGraphAssemblyService
{
    addManagerNode(manager: Manager): Cell
    {
        const cellToReturn = super.addManagerNode(manager);
        this.addToggleSubtreeOverlay(cellToReturn);
        this.addEditEmployeeButtonOverlay(cellToReturn);

        if (manager.canDelete())
        {
            this.addDeleteEmployeeButtonOverlay(cellToReturn);
        }

        return cellToReturn;
    }

    addICNode(ic: IndividualContributor): Cell
    {
        let cellToReturn = super.addICNode(ic);

        this.addEditEmployeeButtonOverlay(cellToReturn);

        if (ic.canDelete())
        {
            this.addDeleteEmployeeButtonOverlay(cellToReturn);
        }

        return cellToReturn;
    }

    addTeamNode(team: Team): Cell
    {
        let cellToReturn = super.addTeamNode(team);

        this.addToggleSubtreeOverlay(cellToReturn);
        this.addEditTeamButtonOverlay(cellToReturn);

        if (team.canDelete())
        {
            this.addDeleteTeamButtonOverlay(cellToReturn);
        }

        // FIXME - This does not account for edges from children to their Teams

        return cellToReturn;
    }

    configureBaseOptions(): void
    {
        super.configureBaseOptions();
        this.graph.setDropEnabled(true);
    }
}

export {EditableOrgChartMaxGraphAssemblyService};
