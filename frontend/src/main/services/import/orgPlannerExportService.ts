import {BaseService, ServiceManager, type Service} from "@sphyrna/service-manager-ts";
import type {OrgPlanner} from "@src/model/orgPlanner";
import {SerializationFormat, type SerializationService} from "orgplanner-common/jscore";
import {OrgPlannerAppServicesConstants} from "../orgPlannerAppServicesConstants";

interface OrgPlannerExportService extends Service
{
    exportSync(orgPlannerToExport: OrgPlanner): string;
    export(orgPlannerToExport: OrgPlanner): Promise<string>;
}

class OrgPlannerExportServiceDefaultImpl extends BaseService implements OrgPlannerExportService
{
    export(orgPlannerToExport: OrgPlanner): Promise<string>
    {
        return new Promise((resolve, reject) => {
            const jsonAugmented = this.exportSync(orgPlannerToExport);

            resolve(jsonAugmented);
        });
    }

    exportSync(orgPlannerToExport: OrgPlanner): string
    {
        const serializationSevice: SerializationService =
            ServiceManager.getService<SerializationService>(OrgPlannerAppServicesConstants.SERIALIZATION_SERVICE_NAME);

        return serializationSevice.serialize(orgPlannerToExport, SerializationFormat.JSON);
    }
}

export {OrgPlannerExportServiceDefaultImpl};
export type{OrgPlannerExportService};
