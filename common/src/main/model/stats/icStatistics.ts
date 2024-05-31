import {Employee, Manager} from "../orgStructure/employee";
import {OrgStructureVisitor} from "../orgStructure/orgStructure";

/**
 * An individual instance of an individual contributor statistic
 */
// FIXME - Should not reference employees, but instead should refernece stats, such as count
interface ICStatistic
{
    readonly ic: Employee;
    readonly manager: Manager;
}

/**
 * ICStatistics contains all statistics related to individual contributors
 */
interface ICStatistics
{
    /**
     * Get an array of individual contribute statistics
     */
    readonly statistics: ICStatistic[];
}

/**
 * An individual instance of an individual contributor statistic
 */
class DefaultICStatistic
{
    private readonly _ic: Employee;
    private readonly _manager: Manager;

    /**
     * Create an instance of ICStatistcs
     *
     * @param {Employee} ic an individual contributor
     * @param {Manager} manager the individual contributor's manager
     */
    constructor(ic: Employee, manager: Manager)
    {
        if (!ic)
        {
            throw new Error("ic must be defined");
        }

        if (!manager)
        {
            throw new Error("manager must be defined");
        }

        this._ic = ic;
        this._manager = manager;
    }

    /**
     * Retrieve the individual contribotur
     * @returns {Employee} the individual contributor
     */
    get ic(): Employee
    {
        return this._ic;
    }

    /**
     * Retrive the individual contributor's manual
     *
     * @returns {Manager} the manager of the individual contributor
     */
    get manager(): Manager
    {
        return this._manager;
    }
}

/**
 * Default implementation of the ICStatistics interface
 */
class DefaultICStatistics implements ICStatistics
{
    private _statistics: ICStatistic[];

    /**
     * Create an instance of ICStatistics
     */
    constructor()
    {
        this._statistics = [];
    }

    /**
     * Add an individual statistic
     *
     * @param {Employee} ic the individual contributor
     * @param {Manager} manager the manager of the individual contributor
     */
    addStatistic(ic: Employee, manager: Manager): void
    {
        if (!ic)
        {
            throw new Error("ic must be defined");
        }

        if (!manager)
        {
            throw new Error("manager must be defined");
        }

        const icStatistic = new DefaultICStatistic(ic, manager);
        this._statistics.push(icStatistic);
    }

    /**
     * Get the statistics
     *
     * @returns {ICStatistic[]} the statistics
     */
    get statistics(): ICStatistic[]
    {
        return this._statistics;
    }
}

/**
 * ICStatisticCollector is used to collect statistics related to individual contributors in an organization.  It
 * follows a visitor pattern to visit each node in the org tree
 */
class ICStatisticsCollector implements OrgStructureVisitor
{
    private readonly _icStatistics: DefaultICStatistics;
    private _currentManager: Manager|undefined;

    /**
     * Create an instance of ICStatisticsCollector
     */
    constructor()
    {
        this._icStatistics = new DefaultICStatistics();
    }

    visitEnter(employee: Employee): void
    {
        if (employee.isManager())
        {
            this._currentManager = employee;
        }
    }

    visitLeave(employee: Employee): void
    {
        if (!employee.isManager())
        {
            if (!this._currentManager)
            {
                throw new Error("Invalid State: _currentManager is not defined");
            }

            this._icStatistics.addStatistic(employee, this._currentManager);
        }
    }

    /**
     * Retrieve the collector statistics
     *
     * @returns {ICStatistics} the collector statistics
     */
    get statistics(): ICStatistics
    {
        return this._icStatistics;
    }
}

export {ICStatisticsCollector};
export type {ICStatistic, ICStatistics};
