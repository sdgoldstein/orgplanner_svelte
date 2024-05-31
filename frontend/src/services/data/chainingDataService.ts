import {BaseService} from "../framework/Service";
import {ServiceConfiguration} from "../framework/ServiceConfiguration";
import {ServiceManager} from "../framework/ServiceManager";
import {ServiceManagerFactory} from "../framework/ServiceManagerFactory";

import {DataService} from "./dataService";

class ChainingDataService extends BaseService implements DataService
{
    static SERVICE_CHAIN_PROPERTY: string = "SERVICE_CHAIN_PROPERTY";

    private readonly _chainedServices: DataService[] = [];

    private get chainedServices(): DataService[]
    {
        return this._chainedServices;
    }

    init(configuration: ServiceConfiguration): void
    {
        super.init(configuration);
        const serviceManager: ServiceManager = ServiceManagerFactory.getInstance().getServiceManager();

        const chainServiceNames: string[] =
            configuration.getPropertyMap().get(ChainingDataService.SERVICE_CHAIN_PROPERTY) as string[];
        chainServiceNames.forEach(
            (value: string,
             index: number) => { this._chainedServices[index] = serviceManager.getService(value) as DataService; });
    }

    getData(depth?: number, queryParameters?: Map<string, string>): string
    {
        let index: number = 0;
        const chainedServicesArray = this.chainedServices;
        const chainedServicesArrayLenth = chainedServicesArray.length;
        let dataToReturn: string;
        do
        {
            dataToReturn = chainedServicesArray[index].getData(depth, queryParameters);
            index++;
        } while ((!dataToReturn) && (index < chainedServicesArrayLenth))

        return dataToReturn;
    }
}

export {ChainingDataService};