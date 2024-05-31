
import {OrgPlannerManager} from "@src/model/orgPlanner";

import {OrgTemplateFactoryImpl} from "../../../common/src/main/model/orgTemplate";

import {LocalStorageDataService} from "./data/localStorageDataService";
import {OrgPlannerExportServiceDefaultImpl} from "./import/orgPlannerExportService";
import {TreeBasedOrgPlannerImportService} from "./import/orgPlannerImportService";
import {OrgPlannerAppServicesConstants} from "./orgPlannerAppServicesConstants";

class OrgPlannerAppServices
{

    static initServices(): void
    {
        const serviceManager: ServiceManager = ServiceManagerFactory.getInstance().getServiceManager();

        const orgPlannerFactoryServiceProvider = new SingletonServiceProvider(OrgPlannerManager);
        serviceManager.defineService(OrgPlannerAppServicesConstants.ORG_PLANNER_MANAGER_SERVICE,
                                     orgPlannerFactoryServiceProvider);

        const orgTemplateFactoryServiceProvider = new SingletonServiceProvider(OrgTemplateFactoryImpl);
        serviceManager.defineService(OrgPlannerAppServicesConstants.ORG_TEMPLATE_FACTORY_SERVICE,
                                     orgTemplateFactoryServiceProvider);

        const localStorageDataServiceProvider = new SingletonServiceProvider(LocalStorageDataService);
        serviceManager.defineService(OrgPlannerAppServicesConstants.LOCAL_STORAGE_DATA_SERVICE,
                                     localStorageDataServiceProvider);

        const fileServiceProvider = new SingletonServiceProvider(BrowserBasedFileService);
        serviceManager.defineService(OrgPlannerAppServicesConstants.FILE_SERVICE, fileServiceProvider);

        // let dataServiceProvider = new SingletonServiceProvider(ServerDataService);
        // serviceManager.defineService(OrgPlannerAppServicesConstants.DATA_SERVICE, dataServiceProvider);

        // let startupDataServiceConfig: ServiceConfiguration = new DefaultServiceConfiguration(new Map<string, any>([ [
        //     ChainingDataService.SERVICE_CHAIN_PROPERTY,
        //     [ OrgPlannerAppServicesConstants.LOCAL_STORAGE_DATA_SERVICE, OrgPlannerAppServicesConstants.DATA_SERVICE
        //     ]
        //] ]));
        // let startupDataServiceProvider = new SingletonServiceProvider(ChainingDataService);
        // serviceManager.defineService(OrgPlannerAppServicesConstants.STARTUP_DATA_SERVICE, startupDataServiceProvider,
        //                              false, startupDataServiceConfig);

        // let startupDataServiceConfig: ServiceConfiguration = new DefaultServiceConfiguration(new Map<string, any>([ [
        //     ChainingDataService.SERVICE_CHAIN_PROPERTY,
        //     [ OrgPlannerAppServicesConstants.LOCAL_STORAGE_DATA_SERVICE, OrgPlannerAppServicesConstants.DATA_SERVICE
        //     ]
        //] ]));
        // let startupDataServiceProvider = new SingletonServiceProvider(ChainingDataService);
        //

        const orgPlannerImportServiceProvider = new SingletonServiceProvider(TreeBasedOrgPlannerImportService);
        serviceManager.defineService(OrgPlannerAppServicesConstants.ORG_PLANNER_IMPORT_SERVICE,
                                     orgPlannerImportServiceProvider);

        const orgPlannerExportServiceProvider = new SingletonServiceProvider(OrgPlannerExportServiceDefaultImpl);
        serviceManager.defineService(OrgPlannerAppServicesConstants.ORG_PLANNER_EXPORT_SERVICE,
                                     orgPlannerExportServiceProvider);

        const orgChartMaxGraphAssemblyService = new NewInstanceServiceProvider(OrgChartMaxGraphAssemblyServiceImpl);
        serviceManager.defineService(OrgPlannerAppServicesConstants.ORG_CHART_MAX_GRAPH_ASSEMBLY_SERVICE,
                                     orgChartMaxGraphAssemblyService);
    }
}

export {OrgPlannerAppServices};
