import type {OrgStatistics} from "../stats/orgStatistics";

import type {Employee, Manager} from "./employee";
import type {OrgEntityPropertyBag, OrgEntityPropertyDescriptor} from "./orgEntity";
import type {Team} from "./team";

/**
 * OrgStructure represent the organizational structure of a particular employee organization
 */
interface OrgStructure
{
    /**
     * if the org structure is locked for editing
     */
    locked: boolean;

    /**
     * Statistics of this org structure
     */
    orgStatistics: OrgStatistics;

    /**
     * The root team of this org structure
     */
    readonly rootTeam: Team;

    /*
     * The leader of this org
     */
    readonly orgLeader: Manager;

    /**
     * Determine if this Org Structure instance is empty
     *
     * @returns {boolean} true if empty; false otherwise
     */
    isEmpty(): boolean;

    /**
     * Retrieve an array of teams managed by a particular manager
     *
     * @param {Manager} manager the manager who manages the returned teams
     * @returns {Team[]} the teams that the specified manager manages
     */
    getTeamsForManager(manager: Manager): Team[];

    /**
     * Determing if the specified manager manages any teams
     *
     * @param {Manager} manager the manager to test
     * @returns {Boolean} true if the manager manages teams; false otherwise
     */
    managerHasTeams(manager: Manager): boolean;

    /**
     * Retrieve an Iteration over the teams in this OrgStructure
     */
    getTeams(): IterableIterator<Team>;

    /**
     * Retrieve Team by ID.  An error is thrown if the team doesn't exist
     */
    getTeam(id: string): Team;

    /**
     * Retrieve Employee by ID.  An error is throw if the employee doesn't exist
     */
    getEmployee(id: string): Employee

    /**
     * Deep clone this org structure
     *
     * @param orgStructure a new org structure with the same data as the one provided, deep cloned
     */
    deepClone(): OrgStructure;

    /**
     * Perform a depth first traversal of the org structure
     *
     * @param {OrgStructureVisitor} orgStructureVisitor a visitor to invoke during the traversal
     * @param {number} depth optional parameter to limit the traversal to a certain depth.  If not specified, the
     *     entire structure is traversed
     */
    traverseDF(orgStructureVisitor: OrgStructureVisitor, depth?: number): void;

    /**
     * Perform a breadth first traversal of the org structure
     *
     * @param {OrgStructureVisitor} orgStructureVisitor a visitor to invoke during the traversal
     * @param {number} depth optional parameter to limit the traversal to a certain depth.  If not specified, the
     *     entire structure is traversed
     */
    traverseBF(orgStructureVisitor: OrgStructureVisitor, depth?: number): void;

    /**
     * Perform a partial breadth first traversal of the org structure
     *
     * @param {OrgStructureVisitor} orgStructureVisitor a visitor to invoke during the traversal
     * @param {string} employeeId the root of the org structure representing the starting point of the traversal
     */
    partialTraverseBF(orgStructureVisitor: OrgStructureVisitor, employeeId: string): void;

    /* -----------------------------------------------------------------------------------------
       Methods for planning/editing
    --------------------------------------------------------------------------------------------*/

    /**
     * While planning the org structure, move the specified employee under the specified manager
     *
     * @param {Employee} employee the employee to move
     * @param {Manager} manager the manager to which the employee is being moved
     * @returns {Employee} the employee, potentially cloned from the original, that has been moved
     */
    moveEmployeeToManager(employee: Employee, manager: Manager): Employee

    /**
     * While planning the org structure, move the specified Team under the specified manager
     *
     * @param {Team} team the team to move
     * @param {Manager} manager the manager to which the team is being moved
     * @returns {Team} the team, potentially cloned from the original, that has been moved
     */
    moveTeamToManager(team: Team, manager: Manager): Team;

    /**
     * Remove the specified employeed from the org structure
     *
     * @param {Employee[]} employeesToRemove the employees to remove
     */
    removeEmployees(employeesToRemove: Employee[]): void;

    /**
     * Create the org leader of this org structure
     */
    createOrgLeader(name: string, title: string, properties: OrgEntityPropertyBag): Manager;

    /**
     * Create a new Employee and add it to the org structure
     */
    createEmployee(name: string, title: string, managerId: string, teamId: string, isManager: boolean,
                   properties: OrgEntityPropertyBag): Employee;

    /**
     * Create the root team of this org structure
     * @param newTeamTitle
     */
    createRootTeam(newTeamTitle: string): Team;

    /**
     * Create a new team and add it to the org structure
     *
     * @param newTeamTitle
     * @param managerId
     */
    createTeam(newTeamTitle: string, managerId: string): Team;

    employeePropertyIterator(): IterableIterator<OrgEntityPropertyDescriptor>;
}

/**
 * OrgStructureVisitor is an interface representing a visitor used to perform logic while traversing the org structure
 */
interface OrgStructureVisitor
{
    /**
     * Invoked when entering an org strcuture node
     *
     * @param {Employee} employee the employee to visit
     */
    visitEnter(employee: Employee): void;

    /**
     * Invoked when leaving an org structure node
     *
     * @param {Employee} employee the employee to visit
     */
    visitLeave(employee: Employee): void;
}

export type{OrgStructure, OrgStructureVisitor};
