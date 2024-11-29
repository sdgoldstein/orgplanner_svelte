import {SimpleStack, type Stack} from "../../jscore/stack";
import type {Employee, Manager} from "../orgStructure/employee";
import type {OrgStructureVisitor} from "../orgStructure/orgStructure";

/**
 * An individual manager statistics
 */
// FIXME - Should be an interface.  Also, should not reference employees, but instead should refernece stats, such as
// count
class ManagerStatistic
{
    private _manager: Manager;
    private _numManagers: number;
    private _numDirects: number;
    private _numReports: number;

    /**
     * Create an instance of ManagerStatistic
     *
     * @param {Manager} manager the manager associated with this statistic
     */
    constructor(manager: Manager)
    {
        if (!manager)
        {
            throw new Error("manager must be defined");
        }

        this._manager = manager;
        this._numManagers = 0;
        this._numDirects = 0;
        this._numReports = 0;
    }

    /**
     * Get the manager associated with this statistic
     *
     * @returns {Manager} the manager associated with this statistic
     */
    get manager(): Employee
    {
        return this._manager;
    }

    /**
     * Increase the number of managers that either directly or indirectly report to this manager
     *
     * @param {number} value the amount to increase the number of managers that either directly or indirectly report to
     *     this manager
     */
    addManagers(value: number): void
    {
        this._numManagers += value;
    }

    /**
     * Retrieve the number of managers that either directly or indirectly reporting to this manager
     *
     * @returns {number} the number of managers that either directly or indirectly reporting to this manager
     */
    get numManagers(): number
    {
        return this._numManagers;
    }

    /**
     * Increase the number of direct reports that report to this manager
     *
     * @param {number} value the amount to increase the number of direct reports reporting to this manager
     */
    addDirects(value: number): void
    {
        this._numDirects += value;
    }

    /**
     * Retrieve the number of direct reports reporting this manager
     *
     * @returns {number} the number of direct reports reporting to this manager
     */
    get numDirects(): number
    {
        return this._numDirects;
    }

    /**
     * Increase the number of individual contributors that that either directly or indirectly report to this manager
     *
     * @param {number} value the amount to increase the number of individual contributors that either directly or
     *     indirectly report to this manager
     */
    addReports(value: number): void
    {
        this._numReports += value;
    }

    /**
     * Retrieve the number of individual contributors that either directly or indirectly reporting to this manager
     *
     * @returns {number} the number of individual contributors that either directly or indirectly report to this manager
     */
    get numReports(): number
    {
        return this._numReports;
    }

    /**
     * Retrieve this manager's manager to individual contributor ratio not including the manager themselves
     *
     * @returns {number} the manager's manager to individual contributor ratio themselves
     */
    get managerToICRatio(): number
    {
        return Math.round(this.numReports / (this.numManagers + 1));
    }
}

/**
 * ManagerStatistics contains all statistics related to managers
 */
interface ManagerStatistics
{
    /**
     * Get an array of manager statistics
     */
    readonly statistics: ManagerStatistic[];
}

/**
 * Default implementation of the ManagerStatistics interface
 */
class DefaultManagerStatistics implements ManagerStatistics
{
    private readonly _statistics: ManagerStatistic[];

    /**
     * Create an instance of DefaultManagerStatistics
     */
    constructor()
    {
        this._statistics = [];
    }

    /*addStatistic(manager, numManagers, numDirects, numReports)
     {
     if (!manager)
     {
     throw new Error("manager must be defined")
     }

     let managerStatistic = new ManagerStastic(manager, numManagers, numDirects, numReports);
     this._statistics.push(managerStatistic);
     }*/

    /**
     * Add an individual manager statistic
     *
     * @param {ManagerStatistic} statisticToAdd the manager statistic to add
     */
    addStatistic(statisticToAdd: ManagerStatistic): void
    {
        if (!statisticToAdd)
        {
            throw new Error("statisticToAdd must be defined");
        }

        this._statistics.push(statisticToAdd);
    }

    get statistics(): ManagerStatistic[]
    {
        return this._statistics;
    }
}

/**
 * ManagerStatisticCollector is used to collect statistics related to individual contributors in an organization.  It
 * follows a visitor pattern to visit each node in the org tree
 */
class ManagerStatisticsCollector implements OrgStructureVisitor
{
    // A stack keeping stack of the current manager node being visited during traversal
    private _managerStack: Stack<ManagerStatistic>;

    // The statistics being calculated during traversal
    private _managerStatistics: DefaultManagerStatistics;

    // Counts being maintained during traversal
    // private _directsCountMap: Map<any, any>;
    // private _managersCountMap: Map<any, any>;
    // private _reportsCountMap: Map<any, any>;

    /**
     * Create an instance of ManagerStatisticsCollector
     */
    constructor()
    {
        this._managerStack = new SimpleStack();

        this._managerStatistics = new DefaultManagerStatistics();
        // this._directsCountMap = new Map();
        // this._managersCountMap = new Map();
        // this._reportsCountMap = new Map();
    }

    visitEnter(employee: Employee): void
    {
        if (employee.isManager())
        {
            const managerStatistic = new ManagerStatistic(employee);
            this._managerStack.push(managerStatistic);
        }
    }

    visitLeave(employee: Employee): void
    {
        if (employee.isManager())
        {
            const managerStatistic = this._managerStack.pop();
            this._managerStatistics.addStatistic(managerStatistic);

            // Add this manager's stats to parent manager if there is a parent manager
            if (!this._managerStack.isEmpty())
            {
                const parentManagerStatistics = this._managerStack.peek();
                parentManagerStatistics.addManagers(managerStatistic.numManagers + 1);
                parentManagerStatistics.addReports(managerStatistic.numReports + 1);
                parentManagerStatistics.addDirects(1);
            }
        }
        else
        {
            // IC - Add direct and report to manager at top of stack
            const managerStatistic = this._managerStack.peek();
            managerStatistic.addDirects(1);
            managerStatistic.addReports(1);
        }
    }

    /*visitLeave(employee)
     {
     let managerId = employee.managerId;
     let directsCount = 0;
     if (this._directsCountMap.has(managerId))
     {
     directsCount = this._directsCountMap.get(managerId);
     }
     directsCount++;
     this._directsCountMap.set(managerId, directsCount);

     let reportsCount = 0;
     if (this._reportsCountMap.has(managerId))
     {
     reportsCount = this._reportsCountMap.get(managerId);
     }
     reportsCount++;
     this._reportsCountMap.set(managerId, reportsCount);

     if (employee.isManager())
     {
     // Collect this manager's manager count
     let employeeManagersCount = 0;
     if (this._managersCountMap.has(employee.id))
     {
     employeeManagersCount = this._managersCountMap.get(employee.id);
     }

     // calculate this manager's manager's manager count
     let managersCount = 1;
     if (this._managersCountMap.has(managerId))
     {
     managersCount = this._managersCountMap.get(managerId);
     managersCount += employeeManagersCount + 1;
     }
     this._managersCountMap.set(managerId, managersCount);

     // collect this manager's reports count
     let employeeReportsCount = 0;
     if (this._reportsCountMap.has(employee.id))
     {
     employeeReportsCount = this._reportsCountMap.get(employee.id);

     // add to parent manager's reports count (Is this right?!)
     reportsCount += employeeReportsCount;
     this._reportsCountMap.set(managerId, reportsCount);
     }

     // collect this manager's directs count
     let directsCount = 0;
     if (this._directsCountMap.has(employee.id))
     {
     directsCount = this._directsCountMap.get(employee.id);
     }

     this._managerStatistics.addStatistic(employee, employeeManagersCount, directsCount, employeeReportsCount);
     }
     }*/

    /**
     * Finalize any stats after traversing the tree
     */
    // FIXME Should this part of a statistics collector interface?  Or, should this be part of the visitor interface,
    // like "endTraversal()"
    finalizeStats(): void
    {
        // noop
    }

    /**
     * Retrieve the collector statistics
     *
     * @returns {ManagerStatistics} the collector statistics
     */
    get statistics(): ManagerStatistics
    {
        return this._managerStatistics;
    }
}

/*class ManagerStastic
 {
 constructor(manager, numManagers, numDirects, numReports)
 {
 if (!manager)
 {
 throw new Error("manager must be defined")
 }

 this._manager = manager;
 this._numManagers = numManagers;
 this._numDirects = numDirects;
 this._numReports = numReports;
 }

 get manager()
 {
 return this._manager;
 }

 get numManagers()
 {
 return this.numManagers;
 }

 get numDirects()
 {
 return this.numDirects;
 }

 get numReports()
 {
 return this.numReports;
 }
 }*/
export {DefaultManagerStatistics, ManagerStatistic, ManagerStatisticsCollector};
export type{ManagerStatistics};
