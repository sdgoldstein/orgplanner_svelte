
import {
    DefaultServiceManagerStrategyImpl,
    ServiceManager} from "@sphyrna/service-manager-ts";

import {OrgPlannerManager} from "@src/model/orgPlanner";
import {BrowserBasedFileService} from "orgplanner-common/jscore";

import {OrgTemplateFactoryImpl} from "../../../../common/src/main/model/orgTemplate";

import {LocalStorageDataService} from "./data/localStorageDataService";
import {OrgPlannerExportServiceDefaultImpl} from "./import/orgPlannerExportService";
import {TreeBasedOrgPlannerImportService} from "./import/orgPlannerImportService";
import {OrgPlannerAppServicesConstants} from "./orgPlannerAppServicesConstants";
import {
    OrgChartMaxGraphAssemblyServiceImpl
} from "@src/components/orgchart/graph/common/assembly/orgChartMaxGraphAssemblyServiceImpl";

class OrgPlannerAppServices
{

    static initServices(): void
    {
        const serviceManagerStrategy: DefaultServiceManagerStrategyImpl = new DefaultServiceManagerStrategyImpl();
        ServiceManager.setDefaultStrategy(serviceManagerStrategy);

        serviceManagerStrategy.registerSingletonService(OrgPlannerAppServicesConstants.ORG_PLANNER_MANAGER_SERVICE,
                                                        OrgPlannerManager);
        serviceManagerStrategy.registerSingletonService(OrgPlannerAppServicesConstants.ORG_TEMPLATE_FACTORY_SERVICE,
                                                        OrgTemplateFactoryImpl);
        serviceManagerStrategy.registerSingletonService(OrgPlannerAppServicesConstants.LOCAL_STORAGE_DATA_SERVICE,
                                                        LocalStorageDataService);
        serviceManagerStrategy.registerSingletonService(OrgPlannerAppServicesConstants.FILE_SERVICE,
                                                        BrowserBasedFileService);

        // let dataServiceProvider = new SingletonServiceProvider(ServerDataService);
        // serviceManagerStrategy.registerSingletonService(OrgPlannerAppServicesConstants.DATA_SERVICE,
        // dataServiceProvider);

        // let startupDataServiceConfig: ServiceConfiguration = new DefaultServiceConfiguration(new Map<string, any>([ [
        //     ChainingDataService.SERVICE_CHAIN_PROPERTY,
        //     [ OrgPlannerAppServicesConstants.LOCAL_STORAGE_DATA_SERVICE, OrgPlannerAppServicesConstants.DATA_SERVICE
        //     ]
        //] ]));
        // let startupDataServiceProvider = new SingletonServiceProvider(ChainingDataService);
        // serviceManagerStrategy.registerSingletonService(OrgPlannerAppServicesConstants.STARTUP_DATA_SERVICE,
        // startupDataServiceProvider,
        //                              false, startupDataServiceConfig);

        // let startupDataServiceConfig: ServiceConfiguration = new DefaultServiceConfiguration(new Map<string, any>([ [
        //     ChainingDataService.SERVICE_CHAIN_PROPERTY,
        //     [ OrgPlannerAppServicesConstants.LOCAL_STORAGE_DATA_SERVICE, OrgPlannerAppServicesConstants.DATA_SERVICE
        //     ]
        //] ]));
        // let startupDataServiceProvider = new SingletonServiceProvider(ChainingDataService);
        //

        serviceManagerStrategy.registerSingletonService(OrgPlannerAppServicesConstants.ORG_PLANNER_IMPORT_SERVICE,
                                                        TreeBasedOrgPlannerImportService);
        serviceManagerStrategy.registerSingletonService(OrgPlannerAppServicesConstants.ORG_PLANNER_EXPORT_SERVICE,
                                                        OrgPlannerExportServiceDefaultImpl);
        serviceManagerStrategy.registerSingletonService(
            OrgPlannerAppServicesConstants.ORG_CHART_MAX_GRAPH_ASSEMBLY_SERVICE, OrgChartMaxGraphAssemblyServiceImpl);
    }
}

export {OrgPlannerAppServices};
