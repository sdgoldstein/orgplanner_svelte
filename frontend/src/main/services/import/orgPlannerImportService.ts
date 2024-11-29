import {BaseService, type Service} from "@sphyrna/service-manager-ts";
import {type OrgPlanner, OrgPlannerDefaultImpl} from "@src/model/orgPlanner";
import {
    type ColorHex,
    DefaultOrgEntityColorThemeImpl,
    type OrgDataCore,
    OrgDataCoreDefaultImpl,
    type OrgEntityPropertyDescriptor,
    OrgEntityTypes,
    type OrgPlan,
    OrgPlanDefaultImpl,
    type OrgSnapshot,
    OrgSnapshotDefaultImpl,
    type PlanningProject,
    PlanningProjectDefaultImpl,
    TreeBasedOrgStructure
} from "orgplanner-common/model";

interface JSONImport
{
    orgPlanner: JSONOrgPlanner;
}

interface JSONOrgPlanner
{
    id: string;
    orgTitle: string;
    settings: JSONOrgPlannerSettings;
    orgSnapshots: JSONOrgSnapshot[];
    planningProjects: JSONPlanningProject[];
}

interface JSONOrgPlannerSettings
{
    employeePropertyDescriptors: JSONPropertyDescriptors[];
    colorTheme: JSONColorTheme;
}

interface JSONPropertyDescriptors
{
    name: string;
    title: string;
    defaultValue: string;
    enabled: boolean;
}

interface JSONColorTheme
{
    name: string;
    label: string;
    orgEntityTypeColorAssignments: JSONOrgEntityTypeColorAssignment[]
}

interface JSONOrgEntityTypeColorAssignment
{
    name: string;
    primary: ColorHex;
    textOnPrimary: ColorHex;
}

interface JSONPlanningProject
{
    title: string;
    orgPlans: JSONOrgPlan[];
}

interface JSONOrgDataCore
{
    title: string;
    orgStructure: JSONOrgstructure;
}

type JSONOrgSnapshot = JSONOrgDataCore;
type JSONOrgPlan = JSONOrgDataCore;

interface JSONOrgstructure
{
    employees: JSONEmployee[];
    teams: JSONTeam[];
}

interface JSONEmployee
{
    id: string;
    name: string;
    jobTitle: string;
    managerId: string;
    teamId: string;
    isManager: boolean;
    properties: JSONProperty[];
}

interface JSONProperty
{
    name: string;
    value: string;
}

interface JSONTeam
{
    id: string;
    title: string;
    managerId: string;
}

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
        const parsedJSON: JSONImport = JSON.parse(json) as JSONImport; const
        orgPlanner : JSONOrgPlanner = parsedJSON.orgPlanner;

        const jsonColorTheme = orgPlanner.settings.colorTheme;
        const
        colorTheme : DefaultOrgEntityColorThemeImpl = new DefaultOrgEntityColorThemeImpl(jsonColorTheme.name,
                                                                                         jsonColorTheme.label);
        if(jsonColorTheme.orgEntityTypeColorAssignments) {
            for (const nextJSONOrgEntityTypeColorAssignment of jsonColorTheme.orgEntityTypeColorAssignments)
            {
                const nextOrgEntityType = OrgEntityTypes.getTypeByName(nextJSONOrgEntityTypeColorAssignment.name);
                colorTheme.setColorAssignment(nextOrgEntityType, {
                    primary : nextJSONOrgEntityTypeColorAssignment.primary,
                    textOnPrimary : nextJSONOrgEntityTypeColorAssignment.textOnPrimary
                });
            }
        }

        const
        employeePropertyDescriptors : Set<OrgEntityPropertyDescriptor> = new Set<OrgEntityPropertyDescriptor>();
        if(orgPlanner.settings.employeePropertyDescriptors) {
            for (const nextJSONPropertyDescriptor of orgPlanner.settings.employeePropertyDescriptors)
            {
                const nextPropertyDescriptor: OrgEntityPropertyDescriptor =
                    this.importPropertyDescriptor(nextJSONPropertyDescriptor);
                employeePropertyDescriptors.add(nextPropertyDescriptor);
            }
        }

        const
        orgPlanSnapshots : OrgSnapshot[] = []; if(orgPlanner.orgSnapshots) {
            orgPlanner.orgSnapshots.forEach((nextOrgSnapshot: JSONOrgSnapshot, index: number) => {
                const orgCoreData: OrgDataCore = this.importOrgDataCore(nextOrgSnapshot, employeePropertyDescriptors);

                orgPlanSnapshots[index] = new OrgSnapshotDefaultImpl(orgCoreData);
            });
        }

        const
        planningProjects : PlanningProject[] = [];
        orgPlanner.planningProjects.forEach((nextPlanningProject: JSONPlanningProject, index: number) => {
            planningProjects[index] = this.importPlanningProject(nextPlanningProject, employeePropertyDescriptors);
        });

        const orgPlannerToReturn = new OrgPlannerDefaultImpl(orgPlanner.orgTitle, orgPlanner.id, orgPlanSnapshots[0],
                                                             planningProjects[0].orgPlan);
        orgPlannerToReturn.settings.employeePropertyDescriptors = employeePropertyDescriptors;
        orgPlannerToReturn.settings.colorTheme = colorTheme;
        return orgPlannerToReturn;
    }

    private importPropertyDescriptor(nextJSONPropertyDescriptor: JSONPropertyDescriptors): OrgEntityPropertyDescriptor {
        return {
            name : nextJSONPropertyDescriptor.name,
                 title: nextJSONPropertyDescriptor.title,
                 defaultValue: nextJSONPropertyDescriptor.defaultValue,
                 enabled: nextJSONPropertyDescriptor.enabled
        } as OrgEntityPropertyDescriptor
    }

    private importPlanningProject(jsonPlanningProject: JSONPlanningProject,
                                  employeePropertyDescriptors: Set<OrgEntityPropertyDescriptor>): PlanningProject {
        const title: string = jsonPlanningProject.title; const
        orgPlans : OrgPlan[] = []; jsonPlanningProject.orgPlans.forEach(
            (nextOrgPlan: JSONOrgPlan,
             index: number) => { orgPlans[index] = this.importOrgPlan(nextOrgPlan, employeePropertyDescriptors);});
        return new PlanningProjectDefaultImpl(title, orgPlans[0]);
    }

    private importOrgPlan(jsonOrgPlan: JSONOrgPlan, employeePropertyDescriptors: Set<OrgEntityPropertyDescriptor>):
    OrgPlan {
        const orgCoreData: OrgDataCore = this.importOrgDataCore(jsonOrgPlan, employeePropertyDescriptors);
        return new OrgPlanDefaultImpl(orgCoreData);
    }

    private importOrgDataCore(orgCoreData: JSONOrgDataCore,
                              employeePropertyDescriptors: Set<OrgEntityPropertyDescriptor>): OrgDataCore {
        const title = orgCoreData.title

        const jsonOrgStructure = orgCoreData.orgStructure;
        const orgStructure: TreeBasedOrgStructure = new TreeBasedOrgStructure(employeePropertyDescriptors);

        // Add teams first.
        const teams: JSONTeam[] = jsonOrgStructure.teams;
        teams.forEach(
            (nextTeam: JSONTeam) => {
        orgStructure.importTeam(nextTeam.id, nextTeam.title, nextTeam.managerId); });

        // Add Employees second
        const employees: JSONEmployee[] = jsonOrgStructure.employees;
        employees.forEach((nextEmployee: JSONEmployee) => {
        const properties = new Map();
        for (const nextProperty of nextEmployee.properties)
        {
            properties.set(nextProperty.name, nextProperty.value);
        }

        orgStructure.importEmployee(nextEmployee.id, nextEmployee.name, nextEmployee.jobTitle, nextEmployee.managerId,
                                    nextEmployee.teamId, nextEmployee.isManager, properties);
        });
        return new OrgDataCoreDefaultImpl(title, orgStructure);
    }
    // FIX ME - This function is really ugly.  Is there a better way?

    /*let teamIdToTeamMap = new Map<string, Team>();
    let managerCountMap = new Map<string, Map<string, number>>();

    parsedJSON.forEach((element: any) => {
        let employeeAdded = this.addEmployeeFromJSON(element);

        let teamId = element.team.id;
        if (!teamIdToTeamMap.has(teamId))
        {
            let importedTeam = new BaseTeam(teamId, element.team.title);
            teamIdToTeamMap.set(teamId, importedTeam);
        }

        let managerMapToIncrease;
        if (!managerCountMap.has(teamId))
        {
            managerMapToIncrease = new Map<string, number>();
            managerCountMap.set(teamId, managerMapToIncrease);
        }
        else
        {
            managerMapToIncrease = managerCountMap.get(teamId)!;
        }

        let managerId = employeeAdded.managerId;
        if (!managerMapToIncrease.has(managerId))
        {
            managerMapToIncrease.set(managerId, 1);
        }
        else
        {
            let currentValue = managerMapToIncrease.get(managerId)!;
            managerMapToIncrease.set(managerId, ++currentValue);
        }
    });

    let managersToTeamMap = new Map<string, Team[]>();

    managerCountMap.forEach((managerToCountMap: Map<string, number>, teamId: string) => {
        let maxEntry: any[] = [];
        managerToCountMap.forEach((count: number, managerId: string) => {
            if ((maxEntry.length === 0) || (count > maxEntry[1]))
            {
                maxEntry = [ managerId, count ];
            }
        });

        if (!teamIdToTeamMap.has(teamId))
        {
            throw new Error("Invalid state - teamIdToTeamMap missing team");
        }
        let teamToAdd: Team = teamIdToTeamMap.get(teamId)!;

        teamToAdd.managerId = maxEntry[0];
        let managerEntry = managersToTeamMap.get(maxEntry[0]);
        if (!managerEntry)
        {
            managerEntry = [ teamToAdd ];
            managersToTeamMap.set(maxEntry[0], managerEntry);
        }
        else
        {
            managerEntry.push(teamToAdd);
        }
    });
    this.managerIdsToTeamsMap = managersToTeamMap;
}*/
}

export { TreeBasedOrgPlannerImportService };
        export type{OrgPlannerImportService};
