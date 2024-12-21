import {v4 as uuidv4} from "uuid";

import {type Node, Tree, TreeVisitor} from "../../jscore/tree";
import type {OrgStatistics} from "../stats/orgStatistics";
import {StatsCollector} from "../stats/statsCollector";

import {BaseIndividualContributor, BaseManager, type Employee, type Manager} from "./employee";
import type {OrgEntityPropertyBag, OrgEntityPropertyDescriptor} from "./orgEntity";
import type {OrgStructure, OrgStructureVisitor} from "./orgStructure";
import {BaseTeam, type Team, TeamConstants} from "./team";
import {
    RegisterSerializable,
    SerializationFormat,
    type SerializationHelper,
    type Serializer,
    BaseJSONSerializer,
    RegisterSerializer,
    JSONSerializationHelper
} from "orgplanner-common/jscore";

class OrgStructureVisitorWrappingTreeVisitor extends TreeVisitor<string, Employee>
{
    private _orgStructureVisitor: OrgStructureVisitor;

    constructor(orgStructureVisitor: OrgStructureVisitor)
    {
        super();

        this._orgStructureVisitor = orgStructureVisitor;
    }

    visitEnter(node: Node<string, Employee>): void
    {
        const employee = node.value;
        this._orgStructureVisitor.visitEnter(employee);
    }

    visitLeave(node: Node<string, Employee>): void
    {
        const employee = node.value;
        this._orgStructureVisitor.visitLeave(employee);
    }
}

/**
 * An org structure visitor that moves a team to a different manager in an
 * existing org structure
 */
class TeamMoveOrgStructureVisitor implements OrgStructureVisitor
{
    private readonly _team: Team;
    private readonly _manager: Manager;
    private readonly _planningOrgStructure;

    constructor(team: Team, manager: Manager, orgStructure: OrgStructure)
    {
        this._team = team;
        this._manager = manager;
        this._planningOrgStructure = orgStructure;
    }

    visitEnter(employee: Employee): void
    {
        if ((employee.team.id === this._team.id) && (!employee.isManager()))
        {
            this._planningOrgStructure.moveEmployeeToManager(employee, this._manager);
        }
    }

    visitLeave(employee: Employee): void
    {
        // Empty
    }
}

/**
 * A Tree based implementation of an OrgStructure
 */
@RegisterSerializable("OrgStructure", 1)
class TreeBasedOrgStructure implements OrgStructure
{
    private static readonly ROOT_MANAGER_ID: string = "ROOT";

    locked: boolean = false;

    orgStatistics: OrgStatistics;

    private _orgLeader: Employee|undefined;
    private _employeePropertyDescriptors: Set<OrgEntityPropertyDescriptor>;

    // All 4 variables are initialized in "initOrReset function
    private _orgTree!: Tree<string, Employee>;
    private _managerIdToTeamsMap!: Map<string, Team[]>;
    private _teamsIdToTeamsMap!: Map<string, Team>;
    private _employeeIdToEmployeeMap!: Map<string, Employee>;

    /**
     * Create an instance of a TreeBasedOrgStructure
     */
    constructor(propertyDescriptors: Set<OrgEntityPropertyDescriptor>)
    {
        this._employeePropertyDescriptors = propertyDescriptors;
        this.initOrReset();

        // FIXME
        this.orgStatistics = StatsCollector.instance.collectStats(this);
    }

    public deepClone(): OrgStructure
    {
        /* FIXME

         /*orgStructure.traverseBF(new CloningOrgStructureVisitor(this.orgTree));

         let teamsToCopy: Team[] = orgStructure.teams;
         let managerIdsToTeamsMap = new Map<string, Team[]>();
         teamsToCopy.forEach((value: Team) => {
             let managerId = value.managerId;
             let teamArray: Team[] = [];
             if (managerIdsToTeamsMap.has(managerId))
             {
                 // We checked has(key), so we can use !
                 teamArray = managerIdsToTeamsMap.get(managerId)!;
             }
             teamArray.push(value);
             managerIdsToTeamsMap.set(managerId, teamArray);
         });
         this.managerIdsToTeamsMap = managerIdsToTeamsMap;*/
        return this;
    }

    importTeam(id: string, title: string, managerId: string): Team
    {
        return this._createTeamImpl(id, title, managerId);
    }

    importEmployee(id: string, name: string, title: string, managerId: string, teamId: string, isManager: boolean,
                   properties: OrgEntityPropertyBag): Employee
    {
        const createdEmployee = this._createEmployeeImpl(id, name, title, managerId, teamId, isManager, properties);
        if (managerId === TreeBasedOrgStructure.ROOT_MANAGER_ID)
        {
            this.orgLeader = createdEmployee;
        }

        return createdEmployee;
    }

    isEmpty(): boolean
    {
        return this.orgTree.isEmpty();
    }

    createTeam(title: string, managerId: string): Team
    {
        const id: string = uuidv4();
        return this._createTeamImpl(id, title, managerId);
    }

    getTeam(id: string): Team
    {
        const valueToReturn = this.teamIdToTeamsMap.get(id);
        if (valueToReturn === undefined)
        {
            throw new Error(`Team with ID, ${id}, does not exist.`);
        }

        return valueToReturn;
    }

    getTeamsForManager(manager: Manager): Team[]
    {
        if (!this._managerIdToTeamsMap.has(manager.id))
        {
            throw new Error("Manager does not have any teams");
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this._managerIdToTeamsMap.get(manager.id)!;
    }

    getTeams(): IterableIterator<Team>
    {
        return this._teamsIdToTeamsMap.values();
    }

    /*export(): Promise<string>
    {
        return new Promise((resolve, reject) => {
            const jsonBuilder = new JSONBuildingTreeVisitor();
            this.orgTree.traverseBF(jsonBuilder);

            resolve(jsonBuilder.json);
        });
    }*/

    managerHasTeams(manager: Manager): boolean
    {
        return this._managerIdToTeamsMap.has(manager.id);
    }

    traverseDF(orgStructureVisitor: OrgStructureVisitor): void
    {
        const treeVisitor = new OrgStructureVisitorWrappingTreeVisitor(orgStructureVisitor);
        this.orgTree.traverseDF(treeVisitor);
    }

    traverseBF(orgStructureVisitor: OrgStructureVisitor): void
    {
        const treeVisitor = new OrgStructureVisitorWrappingTreeVisitor(orgStructureVisitor);
        this.orgTree.traverseBF(treeVisitor);
    }

    partialTraverseBF(orgStructureVisitor: OrgStructureVisitor, employeeId: string): void
    {
        const treeVisitor = new OrgStructureVisitorWrappingTreeVisitor(orgStructureVisitor);
        this.orgTree.partialTraverseBF(treeVisitor, employeeId);
    }

    public moveEmployeeToManager(employee: Employee, manager: Manager): Employee
    {
        employee.managerId = manager.id;
        this.orgTree.moveNodeToParent(employee.id, manager.id);

        return employee;
    }

    moveTeamToManager(team: Team, manager: Manager): Team
    {
        team.managerId = manager.id;

        // Now, we need to move employees from the previous manager to this manager
        // that are members of this team
        const teamMoveVisitor = new TeamMoveOrgStructureVisitor(team, manager, this);
        this.partialTraverseBF(teamMoveVisitor, team.managerId);

        return team;
    }

    createEmployee(name: string, title: string, managerId: string, teamId: string, isManager: boolean,
                   properties: OrgEntityPropertyBag): Employee
    {
        const id: string = uuidv4();
        return this._createEmployeeImpl(id, name, title, managerId, teamId, isManager, properties);
    }

    getEmployee(id: string): Employee
    {
        const valueToReturn = this.employeeIdToEmployeesMap.get(id);
        if (valueToReturn === undefined)
        {
            throw new Error(`Employee with ID, ${id}, does not exist.`);
        }

        return valueToReturn;
    }

    createOrgLeader(name: string, title: string, teamId: string, properties: OrgEntityPropertyBag): Employee
    {
        this.orgLeader =
            this.createEmployee(name, title, TreeBasedOrgStructure.ROOT_MANAGER_ID, teamId, true, properties);
        return this.orgLeader;
    }

    get orgLeader(): Employee
    {
        if (!this._orgLeader)
        {
            throw new Error("Org Leader has not yet been created.");
        }

        return this._orgLeader;
    }

    private set orgLeader(leaderToSet: Employee)
    {
        this._orgLeader = leaderToSet;
    }

    /**
     * Remove the specified employeed from the org structure
     *
     * @param {Employee[]} employeesToRemove the employees to remove
     */
    removeEmployees(employeesToRemove: Employee[]): void
    {
        const nodeIds: string[] = [];
        employeesToRemove.forEach((nextEmployee: Employee) => { nodeIds.push(nextEmployee.id); });

        this.orgTree.removeNodes(nodeIds);
    }

    employeePropertyIterator(): IterableIterator<OrgEntityPropertyDescriptor>
    {
        return this._employeePropertyDescriptors[Symbol.iterator]();
    }

    /**private replaceTeam(originalTeam: Team, clonedTeam: Team): void
    {

        FIXME let originalManagerId = originalTeam.managerId;

        if (!this.managerIdToTeamsMap.has(originalManagerId))
        {
            throw Error("Invalid state - Original team has invalid managerId");
        }
        let teamArray = this.managerIdToTeamsMap.get(originalManagerId)!;

        let newTeamArray = teamArray.filter(value => value.id != originalTeam.id);
        this.managerIdToTeamsMap.set(originalManagerId, newTeamArray);

        let newManagerId = clonedTeam.managerId;
        if (!this.managerIdToTeamsMap.has(newManagerId))
        {
            // FIXME - what if we just created this manager and it has o teams
    yet? throw Error("Invalid state - New team has invalid managerId");
        }
        let newManagerTeamArray = this.managerIdToTeamsMap.get(newManagerId)!;

        newManagerTeamArray.push(clonedTeam);

    }*/

    /*private set managerIdsToTeamsMap(value: Map<string, Team[]>)
    {
        // Refactor so that it's the other way around - set Team[] array and then
    index by manager for performance this._managerIdToTeamsMap = value;
        this._teams = [];

        this._managerIdToTeamsMap.forEach(
            (teamsArray: Team[]) => { Array.prototype.push.apply(this._teams,
    teamsArray); });
    }*/

    private _createEmployeeImpl(id: string, name: string, title: string, managerId: string, teamId: string,
                                isManager: boolean, properties: OrgEntityPropertyBag): Employee
    {
        const team: Team|undefined = this.teamIdToTeamsMap.get(teamId);
        if (team === undefined)
        {
            throw new Error(`Couldn't find team with id, ${teamId}`);
        }

        let employeeToAdd: Employee;
        if (isManager)
        {
            employeeToAdd =
                new BaseManager(id, name, title, managerId, team, this._employeePropertyDescriptors, properties);
        }
        else
        {
            employeeToAdd = new BaseIndividualContributor(id, name, title, managerId, team,
                                                          this._employeePropertyDescriptors, properties);
        }

        this.orgTree.addNode(employeeToAdd.id, employeeToAdd, employeeToAdd.managerId);
        this.employeeIdToEmployeesMap.set(employeeToAdd.id, employeeToAdd);

        return employeeToAdd;
    }

    private _createTeamImpl(id: string, title: string, managerId: string): Team
    {
        const teamToAdd = new BaseTeam(id, title, managerId);

        const ownedTeams: Team[]|undefined = this.managerIdToTeamsMap.get(managerId);
        if (ownedTeams !== undefined)
        {
            ownedTeams.push(teamToAdd);
        }
        else
        {
            this._managerIdToTeamsMap.set(managerId, [ teamToAdd ]);
        }

        this._teamsIdToTeamsMap.set(id, teamToAdd);

        return teamToAdd;
    }

    /**
     * Reset this org structure to initial state (i.e. empty)
     * @protected
     */
    /*private reset(): void
    {
        this.initOrReset();
    }*/

    /**
     * Retrieve the underlying tree structure
     *
     * @returns {Tree} the underlying tree data structure
     * @protected
     */
    private get orgTree(): Tree<string, Employee>
    {
        return this._orgTree;
    }

    /**
     * Retrive the mapping from manager id to managed teams
     * @returns {Map<string, Team[]>} a map, mapping the id of a manager to the
     *     teams that the manager managers
     * @protected
     */
    private get managerIdToTeamsMap(): Map<string, Team[]>
    {
        return this._managerIdToTeamsMap;
    }

    private get employeeIdToEmployeesMap(): Map<string, Employee>
    {
        return this._employeeIdToEmployeeMap;
    }

    private get teamIdToTeamsMap(): Map<string, Team>
    {
        return this._teamsIdToTeamsMap;
    }

    private initOrReset(): void
    {
        this._orgTree = new Tree();
        this._managerIdToTeamsMap = new Map<string, Team[]>();
        this._teamsIdToTeamsMap = new Map<string, Team>();
        this._employeeIdToEmployeeMap = new Map<string, Employee>();

        // FIXME - Need to remove the concept of a NO_TEAM_ID and just make Team optional on the Employee
        this._createTeamImpl(TeamConstants.NO_TEAM_ID, TeamConstants.NO_TEAM_TITLE,
                             TreeBasedOrgStructure.ROOT_MANAGER_ID);
    }
}

@RegisterSerializer("OrgStructure", SerializationFormat.JSON)
class TreeBasedOrgStructureSerializer extends BaseJSONSerializer<OrgStructure> implements
    Serializer<OrgStructure, SerializationFormat.JSON>
{
    static readonly KEY: string = "orgStructure";

    getKey(): string
    {
        return TreeBasedOrgStructureSerializer.KEY;
    }

    getValue(serializableObject: TreeBasedOrgStructure,
             serializationHelper: SerializationHelper<SerializationFormat.JSON>): Record<string, string>
    {
        const valueToReturn: Record<string, string> = {};

        valueToReturn["employeePropertyDescriptors"] =
            this.serializeIterable(serializableObject.employeePropertyIterator(), serializationHelper);

        const serializationTreeVisitor: SerializationTreeVisitor = new SerializationTreeVisitor(serializationHelper);
        serializableObject.traverseBF(serializationTreeVisitor);

        valueToReturn["employees"] = serializationTreeVisitor.getResult();

        const teamIterator: IterableIterator<Team> = serializableObject.getTeams();
        valueToReturn["teams"] = this.serializeIterable(teamIterator, serializationHelper);

        return valueToReturn;
    }

    deserializeObject(dataObject: any, serializationHelper: JSONSerializationHelper): OrgStructure
    {
        const propertyDescriptorsSet: Set < OrgEntityPropertyDescriptor >= new Set();
        const propertyDescriptorMap: Map<string, OrgEntityPropertyDescriptor> = new Map();

        for (let nextSerializedPropertyDescriptor of dataObject.employeePropertyDescriptors)
        {
            const nextPropertyDescriptor: OrgEntityPropertyDescriptor =
                serializationHelper.deserializeObject(nextSerializedPropertyDescriptor);
            propertyDescriptorsSet.add(nextPropertyDescriptor);
            propertyDescriptorMap.set(nextPropertyDescriptor.name, nextPropertyDescriptor);
        }

        const orgStructureToReturn: TreeBasedOrgStructure = new TreeBasedOrgStructure(propertyDescriptorsSet);

        // FIXME - This was the old way to import.  Consider recurive serialization using helper instead

        // Add teams first.
        const teams: any[] = dataObject.teams;
        teams.forEach(
            (nextTeam: any) => { orgStructureToReturn.importTeam(nextTeam.id, nextTeam.title, nextTeam.managerId); });

        // Add Employees second
        const employees: any[] = dataObject.employees;
        employees.forEach((nextEmployee: any) => {
            const properties = new Map();
            for (const nextProperty of nextEmployee.properties)
            {
                properties.set(propertyDescriptorMap.get(nextProperty.name), nextProperty.value);
            }

            orgStructureToReturn.importEmployee(nextEmployee.id, nextEmployee.name, nextEmployee.jobTitle,
                                                nextEmployee.managerId, nextEmployee.teamId,
                                                nextEmployee.isManager == "true", properties);
        });

        return orgStructureToReturn;
    }
}

class SerializationTreeVisitor implements OrgStructureVisitor
{
    private _json: string = "[";
    private _commaNeeded = false;

    constructor(private _serializationHelper: SerializationHelper<SerializationFormat.JSON>) {}

    visitEnter(employee: Employee): void
    {
        if (this._commaNeeded)
        {
            this._json += ",\n";
            for (let i = 0; i < this._serializationHelper.depth; i++)
            {
                this._json += "\t";
            }
        }

        this._json += this._serializationHelper.serialize(employee);

        this._commaNeeded = true;
    }

    visitLeave(employee: Employee): void
    {
        // Empty
    }

    getResult(): string
    {
        return this._json + "]";
    }
}

export {TreeBasedOrgStructure, TreeBasedOrgStructureSerializer};

/*----------------------
Copied from previous PlanningOrgStructure.  Do we need these?
-----------------------*/

/*
class CloningOrgStructureVisitor implements OrgStructureVisitor
{
    private _treeToFill: Tree<string, Employee>;

    constructor(orgTree: Tree<string, Employee>)
    {
        this._treeToFill = orgTree;
    }

    visitEnter(employee: Employee): void
    {
        let nextEmployee: Employee;
        if (employee.isManager())
        {
            nextEmployee = new DeepClonedManager(employee);
        }
        else
        {
            nextEmployee = new DeepClonedIndividualContributor(employee);
        }

        this._treeToFill.addNode(employee.id, nextEmployee,
nextEmployee.managerId);
    }

    visitLeave(employee: Employee): void
    {
        // Do nothing
    }
}

class TeamMoveOrgStructureVisitor implements OrgStructureVisitor
{
    private readonly _team: Team;
    private readonly _manager: Manager;
    private readonly _planningOrgStructure;

    constructor(team: Team, manager: Manager, planningOrgStructure:
PlanningOrgStructure)
    {
        this._team = team;
        this._manager = manager;
        this._planningOrgStructure = planningOrgStructure;
    }

    visitEnter(employee: Employee): void
    {
        if ((employee.team.id === this._team.id) && (!employee.isManager()))
        {
            this._planningOrgStructure.moveEmployeeToManager(employee,
this._manager);
        }
    }

    visitLeave(employee: Employee): void {}
}

class EmployeeEditedEvent extends BasePubSubEvent
{
    private readonly _employee: Employee;

    constructor(employee: Employee)
    {
        super(OrgPlannerAppEvents.EMPLOYEE_EDITED);
        this._employee = employee;
    }

    get employee(): Employee
    {
        return this._employee;
    }
}

class DeepClonedPerson implements Person
{
    name: string;

    constructor(personToClone: Person)
    {
        this.name = personToClone.name;
    }
}

abstract class DeepCloneEmployee extends DeepClonedPerson implements Employee
{
    readonly id: string;
    readonly workCity: string;
    readonly mobilePhone: string;
    title: string;
    managerId: string;
    team: Team;

    constructor(employeeToClone: Employee)
    {
        super(employeeToClone);

        // Note, string's are immutable

        this.id = employeeToClone.id;
        this.mobilePhone = employeeToClone.mobilePhone;
        this.title = employeeToClone.title;
        this.managerId = employeeToClone.managerId;
        this.team = new DeepClonedTeam(employeeToClone.team);
        this.workCity = employeeToClone.workCity;
    }

    abstract isManager(): boolean;
}

class DeepClonedManager extends DeepCloneEmployee implements Manager
{
    constructor(managerToClone: Manager)
    {
        super(managerToClone);
    }

    isManager(): boolean
    {
        return true;
    }
}

class DeepClonedIndividualContributor extends DeepCloneEmployee implements
IndividualContributor
{
    constructor(icToClone: IndividualContributor)
    {
        super(icToClone);
    }

    isManager(): boolean
    {
        return false;
    }
}

class DeepClonedTeam implements Team
{
    id: string;
    title: string;
    managerId: string;

    constructor(teamToClone: Team)
    {
        // Note, string's are immutable

        this.id = teamToClone.id;
        this.title = teamToClone.title;
        this.managerId = teamToClone.managerId
    }
}

export {PlanningOrgStructure, EmployeeEditedEvent};*/