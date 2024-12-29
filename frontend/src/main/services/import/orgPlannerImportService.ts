import {BaseService, ServiceManager, type Service} from "@sphyrna/service-manager-ts";
import {type OrgPlanner} from "@src/model/orgPlanner";
import {type SerializationService, SerializationFormat} from "orgplanner-common/jscore";
import {OrgPlannerAppServicesConstants} from "../orgPlannerAppServicesConstants";

interface OrgPlannerImportService extends Service
{
    import(json: string): Promise<OrgPlanner>;
    importSync(json: string): OrgPlanner;
}

class TreeBasedOrgPlannerImportService extends BaseService implements OrgPlannerImportService
{
    /**
     * Populate the org structure from a json string.  This can be generated with a call to toJSON
     *
     * @param {string} json the json string contained the org structure data
     */
    import(json: string):
        Promise<OrgPlanner> {
            return new Promise((resolve, reject) => {
        const OrgPlannerToReturn = this.importSync(json);
        resolve(OrgPlannerToReturn);
                   });
        }

    /**
     * Populate the org structure from a json string.  This can be generated with a call to toJSON
     *
     * @param {string} json the json string contained the org structure data
     */
    importSync(json: string): OrgPlanner {
        const serializationSevice: SerializationService =
        ServiceManager.getService<SerializationService>(OrgPlannerAppServicesConstants.SERIALIZATION_SERVICE_NAME);

    return serializationSevice.deserialize(json, SerializationFormat.JSON);
    }
}

export { TreeBasedOrgPlannerImportService };
    export type{OrgPlannerImportService};
