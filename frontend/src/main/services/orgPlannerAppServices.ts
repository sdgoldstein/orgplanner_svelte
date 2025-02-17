
import {DefaultServiceManagerStrategyImpl, ServiceManager} from "@sphyrna/service-manager-ts";
import {OrgPlannerManager} from "@src/model/orgPlanner";
import {BrowserBasedFileService, SERIALIZATION_SERVICE_NAME, SerializationServiceImpl} from "orgplanner-common/jscore";
import {OrgTemplateFactoryImpl, PlanningProjectFactorServiceDefaultImpl} from "orgplanner-common/model";

import {LocalStorageDataService} from "./data/localStorageDataService";
import {OrgPlannerExportServiceDefaultImpl} from "./import/orgPlannerExportService";
import {TreeBasedOrgPlannerImportService} from "./import/orgPlannerImportService";
import {OrgPlannerAppServicesConstants} from "./orgPlannerAppServicesConstants";

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
        serviceManagerStrategy.registerSingletonService(
            OrgPlannerAppServicesConstants.PLANNING_PROJECT_FACTORY_SERVICE_NAME,
            PlanningProjectFactorServiceDefaultImpl);
        serviceManagerStrategy.registerSingletonService(SERIALIZATION_SERVICE_NAME, SerializationServiceImpl);

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

        serviceManagerStrategy.registerSingletonService(OrgPlannerAppServicesConstants.SERIALIZATION_SERVICE_NAME,
                                                        SerializationServiceImpl);

        serviceManagerStrategy.registerSingletonService(OrgPlannerAppServicesConstants.ORG_PLANNER_IMPORT_SERVICE,
                                                        TreeBasedOrgPlannerImportService);
        serviceManagerStrategy.registerSingletonService(OrgPlannerAppServicesConstants.ORG_PLANNER_EXPORT_SERVICE,
                                                        OrgPlannerExportServiceDefaultImpl);

        // serviceManagerStrategy.registerSingletonService(
        //      OrgPlannerAppServicesConstants.ORG_CHART_MAX_GRAPH_ASSEMBLY_SERVICE,
        //      OrgChartMaxGraphAssemblyServiceImpl);
    }
}

export {OrgPlannerAppServices};
