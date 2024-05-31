import {BaseService} from "@sphyrna/service-manager-ts";

import type {DataService} from "./dataService";

/**
 * Service to fetch data graph from local browser storage
 */
class LocalStorageDataService extends BaseService implements DataService
{
    private static readonly ORG_STRUCTURE_STATE_KEY: string = 'ORG_STRUCTURE_STATE_KEY_NAME';

    getData(depth?: number|undefined, queryParameters?: Map<string, string>|undefined): string
    {

        let valueToReturn = "";
        const localOrgStructureState = localStorage.getItem(LocalStorageDataService.ORG_STRUCTURE_STATE_KEY);
        if (localOrgStructureState)
        {
            valueToReturn = localOrgStructureState;
        }

        return valueToReturn;
    }

    storeData(orgPlannerJson: string): void
    {
        localStorage.setItem(LocalStorageDataService.ORG_STRUCTURE_STATE_KEY, orgPlannerJson);
    }
}

export {LocalStorageDataService};