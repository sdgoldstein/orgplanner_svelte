import {BaseService, type Service, ServiceManager} from "@sphyrna/service-manager-ts";
import type {DataService} from "@src/services/data/dataService";
import type {LocalStorageDataService} from "@src/services/data/localStorageDataService";
import type {OrgPlannerExportService} from "@src/services/import/orgPlannerExportService";
import type {OrgPlannerImportService} from "@src/services/import/orgPlannerImportService";
import {OrgPlannerAppServicesConstants} from "@src/services/orgPlannerAppServicesConstants";
import {
    EmployeeReservedPropertyDescriptors,
    OrgDataCoreDefaultImpl,
    type OrgEntityColorTheme,
    OrgEntityColorThemes,
    type OrgEntityPropertyDescriptor,
    type OrgPlan,
    OrgPlanDefaultImpl,
    type OrgSnapshot,
    type OrgStructure,
    type OrgTemplate,
    type OrgTemplateFactoryService,
    type PlanningProject,
    PlanningProjectDefaultImpl,
    TreeBasedOrgStructure
} from "orgplanner-common/model";
import {v4 as uuidv4} from 'uuid';

import {OrgPlannerConstants} from "./orgPlannerConstants";

const DEFAULT_EMPLOYEE_PROPERTY_DESCRIPTORS: Set<OrgEntityPropertyDescriptor> = new Set<OrgEntityPropertyDescriptor>(
    [ EmployeeReservedPropertyDescriptors.PHONE, EmployeeReservedPropertyDescriptors.LOCATION ]);

interface OrgPlannerSettings
{
    colorTheme: OrgEntityColorTheme;
    employeePropertyDescriptors: Set<OrgEntityPropertyDescriptor>;
}

class OrgPlannerSettingsDefaultImpl implements OrgPlannerSettings
{
    employeePropertyDescriptors: Set<OrgEntityPropertyDescriptor> = DEFAULT_EMPLOYEE_PROPERTY_DESCRIPTORS;
    colorTheme: OrgEntityColorTheme = OrgEntityColorThemes.DEEP_BLUE_THEME;
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
     * The current org snapshot of the org being planned
     */
    readonly presentOrg: OrgSnapshot|undefined;

    /**
     * The planning project the represents the planning state
     */
    readonly planningProject: PlanningProject;

    /**
     * Determine if a present org has been imported or configured
     */
    hasPresentOrg(): boolean;

    /*
     *  Create a new snapshot of the planning org
     */
    createSnapshot(snapshotName: string): void;
}

class OrgPlannerDefaultImpl implements OrgPlanner
{
    orgTitle: string;
    readonly id: string;
    settings: OrgPlannerSettings;

    private _presentOrg: OrgSnapshot|undefined;

    // Set in the constructor by calling internal methods
    private _planningProject!: PlanningProjectDefaultImpl;

    constructor(orgTitle: string);
    constructor(orgTitle: string, id: string, presentOrg: OrgSnapshot);
    constructor(orgTitle: string, id: string, planningOrg: OrgPlan);
    constructor(orgTitle: string, id: string, presentOrg: OrgSnapshot, planningOrg: OrgPlan);

    constructor(orgTitle: string, id?: string, presentOrg?: OrgSnapshot, planningOrg?: OrgPlan)
    {
        this.orgTitle = orgTitle;
        this.id = id ?? uuidv4();

        this.settings = new OrgPlannerSettingsDefaultImpl();

        if (presentOrg !== undefined)
        {
            this.presentOrg = presentOrg;
            this.planningProject = new PlanningProjectDefaultImpl(orgTitle, this.presentOrg);
        }
        else if (planningOrg !== undefined)
        {
            this.planningProject = new PlanningProjectDefaultImpl(orgTitle, planningOrg);
        }
        else
        {
            const orgStructure: OrgStructure = new TreeBasedOrgStructure(this.settings.employeePropertyDescriptors);
            const orgDataCore = new OrgDataCoreDefaultImpl(orgTitle, orgStructure);
            const orgPlan = new OrgPlanDefaultImpl(orgDataCore);
            this.planningProject = new PlanningProjectDefaultImpl(orgTitle, orgPlan);
        }
    }

    get presentOrg(): OrgSnapshot
    {
        if (!this.hasPresentOrg())
        {
            throw new Error("Present org is undefined");
        }

        return this._presentOrg!;
    }

    private set presentOrg(orgSnapshot: OrgSnapshot)
    {
        this._presentOrg = orgSnapshot;
    }

    get planningProject(): PlanningProjectDefaultImpl
    {
        return this._planningProject;
    }

    private set planningProject(planningProject: PlanningProjectDefaultImpl)
    {
        this._planningProject = planningProject;
    }

    hasPresentOrg(): boolean{return(this._presentOrg !== undefined)}

    createSnapshot(snapshotName: string): void
    {
        this.presentOrg = {orgDataCore : this.planningProject.orgPlan.orgDataCore.clone()} as OrgSnapshot;
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
        orgTemplate.apply(orgPlannerToReturn.planningProject.orgPlan.orgDataCore.orgStructure);

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

export {OrgPlannerManager, OrgPlannerDefaultImpl, DEFAULT_EMPLOYEE_PROPERTY_DESCRIPTORS};
export type {OrgPlanner, OrgPlannerSettings};
