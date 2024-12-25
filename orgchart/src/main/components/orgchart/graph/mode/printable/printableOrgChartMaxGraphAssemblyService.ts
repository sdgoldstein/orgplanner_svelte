
import type {OrgChartMaxGraphAssemblyService} from "../shared/orgChartMaxGraphAssemblyService";
import {OrgChartMaxGraphAssemblyServiceBase} from "../shared/orgChartMaxGraphAssemblyServiceBase";

class PrintableOrgChartMaxGraphAssemblyService extends OrgChartMaxGraphAssemblyServiceBase implements
    OrgChartMaxGraphAssemblyService
{
    configureBaseOptions(): void
    {
        super.configureBaseOptions();

        this.graph.setCellsSelectable(false);
        this.graph.setCellsMovable(false);
    }
}

export {PrintableOrgChartMaxGraphAssemblyService};
