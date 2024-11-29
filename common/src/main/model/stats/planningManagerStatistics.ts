import {SimpleStack, type Stack} from "../../jscore/stack";
import type {Employee} from "../orgStructure/employee";
import type {OrgStructure, OrgStructureVisitor} from "../orgStructure/orgStructure";

import {ManagerStatistic, type ManagerStatistics} from "./managerStatistics";

/**
 * ManagerStatisticUpdated is used to finishEdit planning manager statistics when an planning org structure changes
 */
class ManagerStatisticsUpdater implements OrgStructureVisitor
{
    // Keep track of managers during traversal
    private _managerStack: Stack<PlanningManagerStatistic>;

    private readonly _planningManagerStatistics: PlanningManagerStatistics;
    private readonly _visitedManagerStatistics: Map<string, PlanningManagerStatistic>;

    /**
     * Create an instance of ManagerStatisticsUpdater
     *
     * @param {PlanningManagerStatistics} planningManagerStatistics
     */
    constructor(planningManagerStatistics: PlanningManagerStatistics)
    {
        this._planningManagerStatistics = planningManagerStatistics;
        this._managerStack = new SimpleStack();
        this._visitedManagerStatistics = new Map<string, PlanningManagerStatistic>();
    }

    visitEnter(employee: Employee): void
    {
        if (employee.isManager())
        {
            let managerStatistic = this.planningManagerStatistics.getStatistic(employee.id);
            if (!managerStatistic)
            {
                // this is a manager recently added to the plan
                managerStatistic = new PlanningManagerStatistic(new ManagerStatistic(employee));
            }
            managerStatistic.reset();
            this._managerStack.push(managerStatistic);
            this._visitedManagerStatistics.set(employee.id, managerStatistic);
        }
    }

    visitLeave(employee: Employee): void
    {
        if (employee.isManager())
        {
            const managerStatistic = this._managerStack.pop();

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

    /**
     * Retrieve the updated statistics
     *
     * @returns {Map<string, PlanningManagerStatistic>} the updated statistics
     */
    get visitedStatistics(): Map<string, PlanningManagerStatistic>
    {
        return this._visitedManagerStatistics;
    }

    /**
     * Retrieve the array of statistics being updated
     *
     * @returns {PlanningManagerStatistics} the array of statistics being updated
     * @private
     */
    private get planningManagerStatistics(): PlanningManagerStatistics
    {
        return this._planningManagerStatistics;
    }
}

/**
 * An individual PlanningManagerStatistic
 */
// FIXME - Should be an interface.
class PlanningManagerStatistic
{
    private _wrappedStatistic: ManagerStatistic;
    private _modified: boolean;

    private _numManagers: number;
    private _numDirects: number;
    private _numReports: number;

    /**
     * Create an instance of PlanningManagerStatistic
     *
     * @param {ManagerStatistic} wrappedStatistic an individual manager statistic associated with the org prior to
     *     planning
     */
    constructor(wrappedStatistic: ManagerStatistic)
    {
        if (!wrappedStatistic)
        {
            throw new Error("wrappedStatistic must be defined");
        }

        this._wrappedStatistic = wrappedStatistic;
        this._modified = false;

        this._numManagers = 0;
        this._numDirects = 0;
        this._numReports = 0;
    }

    /**
     * Reset this planning manager statistic to the starting state
     */
    reset(): void
    {
        this._modified = true;

        this._numManagers = 0;
        this._numDirects = 0;
        this._numReports = 0;
    }

    /**
     * Get the manager associated with this planning manager statistic
     *
     * @returns {Manager} the manager associated with this planning manager statistic
     */
    get manager(): Employee
    {
        return this.wrappedStatistic.manager;
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
        let numberToReturn = this._wrappedStatistic.numManagers;
        if (this._modified)
        {
            numberToReturn = this._numManagers;
        }
        return numberToReturn;
    }

    /**
     * Determine if the number of reporting managers is different from the org prior to planning
     *
     * @returns {boolean} true if the number of managers is different from the org prior to planning; false otherwise
     */
    get hasNumManagersDiff(): boolean
    {
        return this.numManagersDiff !== 0;
    }

    /**
     * Retrieve the difference between the number of reporting managers in the org in the planning state versus the
     * state priot to planning
     *
     * @returns {Number} the difference between the number of reporting managers in the org in the planning state
     *     versus the state priot to planning
     */
    get numManagersDiff(): number
    {
        let numberToReturn = 0;
        if (this._modified)
        {
            numberToReturn = this.numManagers - this._wrappedStatistic.numManagers;
        }

        return numberToReturn;
    }

    /**
     * Increase the number of individual contributors that that either directly or indirectly report to this manager
     *
     * @param {number} value the amount to increase the number of individual contributors that either directly or
     *     indirectly report to this manager
     */
    addDirects(value: number): void
    {
        this._numDirects += value;
    }

    /**
     * Retrieve the number of individual contributors that either directly or indirectly reporting to this manager
     *
     * @returns {number} the number of individual contributors that either directly or indirectly report to this manager
     */
    get numDirects(): number
    {
        let numberToReturn = this._wrappedStatistic.numDirects;
        if (this._modified)
        {
            numberToReturn = this._numDirects;
        }

        return numberToReturn;
    }

    /**
     * Determine if the number of direct reporting employees is different from the org prior to planning
     *
     * @returns {boolean} true if the number of direct reporting remployees is different from the org prior to planning;
     *     false otherwise
     */
    get hasNumDirectsDiff(): boolean
    {
        return this.numDirectsDiff !== 0;
    }

    /**
     * Retrieve the difference between the number of direct reporting employees in the org in the planning state versus
     * the state priot to planning
     *
     * @returns {Number} the difference between the number of direct reporting employees in the org in the planning
     *     state versus the state priot to planning
     */
    get numDirectsDiff(): number
    {
        let numberToReturn = 0;
        if (this._modified)
        {
            numberToReturn = this.numDirects - this._wrappedStatistic.numDirects;
        }

        return numberToReturn;
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
        let numberToReturn = this._wrappedStatistic.numReports;
        if (this._modified)
        {
            numberToReturn = this._numReports;
        }

        return numberToReturn;
    }

    /**
     * Determine if the number of direct or indirect reporting employees is different from the org prior to planning
     *
     * @returns {boolean} true if the number of direct or indirect reporting employees is different from the org prior
     *     to planning; false otherwise
     */
    get hasNumReportsDiff(): boolean
    {
        return this.numReportsDiff !== 0;
    }

    /**
     * Retrieve the difference between the number of direct or indirect  reporting employees in the org in the planning
     * state versus the state priot to planning
     *
     * @returns {Number} the difference between the number of direct or indirect  reporting employees in the org in the
     *     planning state versus the state prior to planning
     */
    get numReportsDiff(): number
    {
        let numberToReturn = 0;
        if (this._modified)
        {
            numberToReturn = this.numReports - this._wrappedStatistic.numReports;
        }

        return numberToReturn;
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

    /**
     * Retrieve the underlying manager statistic associated with the org state prior to planning
     *
     * @returns {ManagerStatistic} the underlying manager statistic associated with the org state prior to planning
     * @private
     */
    private get wrappedStatistic(): ManagerStatistic
    {
        return this._wrappedStatistic;
    }
}

/**
 * A version of manager statistics that is associated with an org in planning state
 */
class PlanningManagerStatistics
{
    // A reference to the manager statistics from the state of the org prior to planning
    // private readonly _wrappedManagerStatistics: ManagerStatistics;

    // FIXME - Do we need both these data structures?  Seems superfluous
    private _statistics: PlanningManagerStatistic[];
    private _statisticsMap: Map<string, PlanningManagerStatistic>;

    /**
     * Create an instance of PlanningManagerStatistics
     *
     * @param {ManagerStatistics} managerStatistics the manager statistics of the org prior to planning
     */
    constructor(managerStatistics: ManagerStatistics)
    {
        // this._wrappedManagerStatistics = managerStatistics;
        this._statistics = new Array<PlanningManagerStatistic>();
        this._statisticsMap = new Map<string, PlanningManagerStatistic>();

        managerStatistics.statistics.forEach((nextStatistic: ManagerStatistic) => {
            const nextPlanningStatistic = new PlanningManagerStatistic(nextStatistic);
            this._statistics.push(nextPlanningStatistic);
            this._statisticsMap.set(nextPlanningStatistic.manager.id, nextPlanningStatistic);
        });
    }

    /**
     * Get an array of indviidual planning manager statistics associated with this org in planning state
     *
     * @returns {PlanningManagerStatistic[]} an array of indviidual planning manager statistics associated with this
     *     org in planning state
     */
    get statistics(): PlanningManagerStatistic[]
    {
        // temp
        return this._statistics;
    }

    /**
     * Set the array of individual planning manager statistics associated with this org in planning state.  This is
     * used when an org structure is updated.  See finishEdit method
     *
     * @param {PlanningManagerStatistic[]} statistics the array of individual planning manager statistics associated
     *     with this org in planning state
     * @private
     */
    private set statistics(statistics: PlanningManagerStatistic[])
    {
        this._statistics = statistics;
    }

    /**
     * Update the planning manager statics based on the state in the provided org structure
     *
     * @param {OrgStructure} planningOrgStructure the org structure with the updated state
     */
    update(planningOrgStructure: OrgStructure): void
    {
        const statUpdater = new ManagerStatisticsUpdater(this);
        planningOrgStructure.traverseDF(statUpdater);
        this._statisticsMap = statUpdater.visitedStatistics;
        this.statistics = Array.from(this._statisticsMap.values());
    }

    /**
     * Rertieve an individual planning manager statustic by manager id
     *
     * @param {string} id the id of the manager associated with the statistics to retrive
     * @returns {PlanningManagerStatistic | undefined} the manager statistic associated with the manager with the
     *     provided id
     */
    // FIXME - Ideally, this should return undefined?
    getStatistic(id: string): PlanningManagerStatistic|undefined
    {
        return this._statisticsMap.get(id);
    }
}

export {PlanningManagerStatistics, PlanningManagerStatistic};