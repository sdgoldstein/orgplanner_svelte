import {BaseService, type Service, ServiceManager} from "@sphyrna/service-manager-ts";
import type {DataService} from "@src/services/data/dataService";
import type {LocalStorageDataService} from "@src/services/data/localStorageDataService";
import type {OrgPlannerExportService} from "@src/services/import/orgPlannerExportService";
import type {OrgPlannerImportService} from "@src/services/import/orgPlannerImportService";
import {OrgPlannerAppServicesConstants} from "@src/services/orgPlannerAppServicesConstants";
import {
    EmployeeReservedPropertyDescriptors,
    type OrgDataCore,
    OrgDataCoreDefaultImpl,
    type OrgEntityColorTheme,
    OrgEntityColorThemes,
    type OrgEntityPropertyDescriptor,
    OrgPlanDefaultImpl,
    type OrgSnapshot,
    type OrgStructure,
    type OrgTemplate,
    type OrgTemplateFactoryService,
    type PlanningProject,
    PlanningProjectDefaultImpl,
    TreeBasedOrgStructure
} from "orgplanner-common/model";
import {v4 as uuidv4} from "uuid";

import {OrgPlannerConstants} from "./orgPlannerConstants";
import {
    BaseJSONSerializer,
    JSONSerializationHelper,
    RegisterSerializable,
    RegisterSerializer,
    SerializationFormat,
    type Serializer
} from "orgplanner-common/jscore";

const DEFAULT_EMPLOYEE_PROPERTY_DESCRIPTORS: Set<OrgEntityPropertyDescriptor> = new Set<OrgEntityPropertyDescriptor>(
    [ EmployeeReservedPropertyDescriptors.PHONE, EmployeeReservedPropertyDescriptors.LOCATION ]);

interface OrgPlannerSettings
{
    colorTheme: OrgEntityColorTheme;
    employeePropertyDescriptors: Set<OrgEntityPropertyDescriptor>;
}

@RegisterSerializable("OrgPlannerSettings", 1)
class OrgPlannerSettingsDefaultImpl implements OrgPlannerSettings
{
    constructor(public employeePropertyDescriptors:
                    Set<OrgEntityPropertyDescriptor> = DEFAULT_EMPLOYEE_PROPERTY_DESCRIPTORS,
                public colorTheme: OrgEntityColorTheme = OrgEntityColorThemes.DEEP_BLUE_THEME)
    {
    }
}

@RegisterSerializer("OrgPlannerSettings", SerializationFormat.JSON)
class OrgPlannerSettingsDefaultImplSerializer extends BaseJSONSerializer<OrgPlannerSettings> implements
    Serializer<OrgPlannerSettings, SerializationFormat.JSON>
{
    deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): OrgPlannerSettings
    {
        const colorTheme: OrgEntityColorTheme = serializationHelper.deserializeObject(dataObject.colorTheme);
        const employeePropertyDescriptors: Set<OrgEntityPropertyDescriptor> =
            new Set(this.deserializeIterable<OrgEntityPropertyDescriptor>(
                dataObject.employeePropertyDescriptors as any[], serializationHelper));

        return new OrgPlannerSettingsDefaultImpl(employeePropertyDescriptors, colorTheme);
    }
}

/**
 * OrgPlanner is the root data model of the Org Planner application.
 *
 * In future, OrgPlannerApp will have 1-n OrgPlanner's
 * OrgPlanner will have 1 - n PlanningProject's
 * PlanningPronject will have 1 - n plans or drafts
 *
 * Depending on how it's created, an OrgPlanner may or may not have a present org structure
 * It will always have at least one planning project with at least one planning org structure that will be built using
 * the present org structure, if it exists
 */
interface OrgPlanner
{
    // The ID of this org planner.
    readonly id: string;
    settings: OrgPlannerSettings;

    /**
     * The id of the org leader for the org being planned
     */
    orgTitle: string;

    /**
     * The org snapshots that have been imported or saves
     */
    readonly orgSnapshots: OrgSnapshot[];

    /**
     * The root planning project the represents the planning state.  In the future, could have multiple planning
     * projects per org
     */
    readonly rootPlanningProject: PlanningProject;

    /*
     *  Create a new snapshot of the planning org
     */
    createSnapshot(snapshotName: string): void;
}

@RegisterSerializable("OrgPlanner", 1)
class OrgPlannerDefaultImpl implements OrgPlanner
{
    orgTitle: string;
    readonly id: string;
    readonly rootPlanningProject: PlanningProject;

    constructor(orgTitle: string);
    constructor(orgTitle: string, id: string, planningOrg: PlanningProject);
    constructor(orgTitle: string, id: string, planningOrg: PlanningProject, orgSnapshots: OrgSnapshot[]);
    constructor(orgTitle: string, id: string, planningOrg: PlanningProject, orgSnapshots: OrgSnapshot[],
                settings: OrgPlannerSettings);
    constructor(orgTitle: string, id?: string, planningOrg?: PlanningProject,
                public readonly orgSnapshots: OrgSnapshot[] = [],
                public readonly settings: OrgPlannerSettings = new OrgPlannerSettingsDefaultImpl())
    {
        this.orgTitle = orgTitle;
        this.id = id ?? uuidv4();

        if (planningOrg !== undefined)
        {
            this.rootPlanningProject = planningOrg;
        }
        else
        {
            let planningOrgDataCore: OrgDataCore;
            if (this.orgSnapshots.length > 0)
            {
                // Load form the first snapshot?  Not ideal, but not sure if there is an altnerative at this point
                planningOrgDataCore = this.orgSnapshots[0].orgDataCore.clone();
            }
            else
            {
                const orgStructure: OrgStructure = new TreeBasedOrgStructure(this.settings.employeePropertyDescriptors);
                planningOrgDataCore = new OrgDataCoreDefaultImpl(orgTitle, orgStructure);
            }

            const orgPlan = new OrgPlanDefaultImpl(planningOrgDataCore);
            this.rootPlanningProject = new PlanningProjectDefaultImpl(orgTitle, orgPlan);
        }
    }

    createSnapshot(snapshotName: string): void
    {
        const snapshotOrgDataCore = this.rootPlanningProject.orgPlan.orgDataCore.clone();
        snapshotOrgDataCore.title = snapshotName;
        this.orgSnapshots.push({orgDataCore : snapshotOrgDataCore} as OrgSnapshot)
    }
}

@RegisterSerializer("OrgPlanner", SerializationFormat.JSON)
class OrgPlanDefaultImplSerializer extends BaseJSONSerializer<OrgPlanner> implements
    Serializer<OrgPlanner, SerializationFormat.JSON>
{
    deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): OrgPlanner
    {
        const settings: OrgPlannerSettings = serializationHelper.deserializeObject(dataObject.settings);
        const orgSnapshots: OrgSnapshot[] =
            this.deserializeIterable<OrgSnapshot>(dataObject.orgSnapshots, serializationHelper);
        const rootPlanningProject: PlanningProject =
            serializationHelper.deserializeObject(dataObject.rootPlanningProject);

        return new OrgPlannerDefaultImpl(dataObject.orgTitle, dataObject.id, rootPlanningProject, orgSnapshots,
                                         settings);
    }
}

class OrgPlannerManager extends BaseService implements Service
{
    static DEFAULT_ORG_TEMPLATE: string = "Simple";

    createOrgPlannerSync(bypassLocalStorageTemplate?: string): OrgPlanner
    {
        const dataService =
            ServiceManager.getService<DataService>(OrgPlannerAppServicesConstants.LOCAL_STORAGE_DATA_SERVICE);
        const jsonOrgData = dataService.getData();

        let valueToReturn: OrgPlanner;
        if ((jsonOrgData.length > 0) && (!bypassLocalStorageTemplate))
        {
            const orgStructureImportService: OrgPlannerImportService =
                ServiceManager.getService<OrgPlannerImportService>(
                    OrgPlannerAppServicesConstants.ORG_PLANNER_IMPORT_SERVICE);
            valueToReturn = orgStructureImportService.importSync(jsonOrgData);
        }
        else
        {
            valueToReturn =
                this.createOrgPlannerWithTitle(OrgPlannerConstants.NEW_ORG_STRUCTURE_TITLE, bypassLocalStorageTemplate);
        }

        return valueToReturn;
    }

    createOrgPlannerWithTitle(orgTitle: string,
                              orgTemplateName: string = OrgPlannerManager.DEFAULT_ORG_TEMPLATE): OrgPlanner
    {
        const orgPlannerToReturn = new OrgPlannerDefaultImpl(orgTitle);

        const templateFactoryService = ServiceManager.getService<OrgTemplateFactoryService>(
            OrgPlannerAppServicesConstants.ORG_TEMPLATE_FACTORY_SERVICE);
        const orgTemplate: OrgTemplate = templateFactoryService.getTemplate(orgTemplateName);
        orgTemplate.apply(orgPlannerToReturn.rootPlanningProject.orgPlan.orgDataCore.orgStructure);

        return orgPlannerToReturn;
    }

    exportOrgPlanner(orgPlannerToSave: OrgPlanner): void
    {
        const orgStructureExportService: OrgPlannerExportService = ServiceManager.getService<OrgPlannerExportService>(
            OrgPlannerAppServicesConstants.ORG_PLANNER_EXPORT_SERVICE);
        orgStructureExportService.exportSync(orgPlannerToSave);
    }

    storeOrgPlanner(orgPlannerToStore: OrgPlanner): void
    {
        const orgStructureExportService: OrgPlannerExportService = ServiceManager.getService<OrgPlannerExportService>(
            OrgPlannerAppServicesConstants.ORG_PLANNER_EXPORT_SERVICE);

        const orgPlannerJson: string = orgStructureExportService.exportSync(orgPlannerToStore);

        const localStorageDataService: LocalStorageDataService = ServiceManager.getService<LocalStorageDataService>(
            OrgPlannerAppServicesConstants.LOCAL_STORAGE_DATA_SERVICE);

        localStorageDataService.storeData(orgPlannerJson);
    }
}

export {
    OrgPlannerManager,
    OrgPlannerDefaultImpl,
    OrgPlannerSettingsDefaultImpl,
    OrgPlanDefaultImplSerializer,
    DEFAULT_EMPLOYEE_PROPERTY_DESCRIPTORS
};
export type{OrgPlanner, OrgPlannerSettings, OrgPlannerSettingsDefaultImplSerializer};
