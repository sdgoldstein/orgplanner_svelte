import {Employee} from "../orgStructure/employee";
import {OrgStructureVisitor} from "../orgStructure/orgStructure";

/**
 * An individual org summary statistic
 */
// FIXME - Should be an interface.
class OrgSummaryStatistic
{
    private _title: string;
    private _numEmployees: number;
    private _numManagers: number;
    private _managerToICRatio: number;
    private _numICs: number;

    /**
     * Create an instance of OrgSummaryStatistic
     * @param {string} title the title of the org
     * @param {number} numEmployees the number of employees in the org
     * @param {number} numManagers the number of managers in the org
     * @param {number} numICs the number of ICs in the org
     */
    constructor(title: string, numEmployees: number, numManagers: number, numICs: number)
    {
        this._title = title;

        this._numEmployees = numEmployees;
        this._numManagers = numManagers;
        this._numICs = numICs;
        this._managerToICRatio = Math.round(numEmployees / numManagers);
    }

    get title(): string
    {
        return this._title;
    }

    /**
     * Retrieve the number of employees in the org
     *
     * @returns {number} the number of employees in the org
     */
    get numEmployees(): number
    {
        return this._numEmployees;
    }

    /**
     * Retrieve the number of managers in the org
     *
     * @returns {number} the number of managers in the org
     */
    get numManagers(): number
    {
        return this._numManagers;
    }

    /**
     * Retrieve the number of individual contributor in the org
     *
     * @returns {number} the number of individual contributor in the org
     */
    get numICs(): number
    {
        return this._numICs;
    }

    /**
     * Retrieve the overall manager to IC ration in the org - does not include the org leader
     *
     * @returns {number} the overall manager to IC ration in the org
     */
    get managerToICRatio(): number
    {
        return this._managerToICRatio;
    }
}

/**
 * OrgSummaryStatistics contains informantion/statistics about the entire organization
 */
interface OrgSummaryStatistics
{
    readonly statistics: OrgSummaryStatistic[];
}

/**
 * Default implmenetation of the OrgSummaryStatistics interface
 */
class DefaultOrgSummaryStatistics implements OrgSummaryStatistics
{
    private _statistics: OrgSummaryStatistic[];

    /**
     * Create an instance of DefaultOrgSummaryStatistics
     */
    constructor()
    {
        this._statistics = [];
    }

    /**
     * Add an indivudal org summary statistic
     *
     * @param {string} title org title
     * @param {number} numEmployees number of employees in the org
     * @param {number} numManagers number of managers in the org
     * @param {number} numICs number of individual contributors in the org
     */
    addStatistic(title: string, numEmployees: number, numManagers: number, numICs: number): void
    {
        const orgStatistic = new OrgSummaryStatistic(title, numEmployees, numManagers, numICs);
        this._statistics.push(orgStatistic);
    }

    get statistics(): OrgSummaryStatistic[]
    {
        return this._statistics;
    }
}

/**
 * OrgSummaryStatisticCollector is used to collect summary statistics of the organization.  It
 * follows a visitor pattern to visit each node in the org tree
 */
class OrgSummaryStatisticsCollector implements OrgStructureVisitor
{
    // the statistics being generated
    private _orgStatistics: DefaultOrgSummaryStatistics;

    // variables holding count related statistics during traveral
    private _numEmployees: number;
    private _numManagers: number;
    private _numICs: number;

    /**
     * Create an instance of OrgSummaryStatisticsCollector
     */
    constructor()
    {
        this._orgStatistics = new DefaultOrgSummaryStatistics();

        this._numEmployees = 0;
        this._numManagers = 0;
        this._numICs = 0;
    }

    visitEnter(employee: Employee): void
    {
        this._numEmployees++;
        if (employee.isManager())
        {
            this._numManagers++;
        }
        else
        {
            this._numICs++;
        }
    }

    public visitLeave(employee: Employee): void
    {
        // Do Nothing
    }

    /**
     * Finalize any stats after traversing the tree
     */
    // FIXME Should this part of a statistics collector interface?  Or, should this be part of the visitor interface,
    // like "endTraversal()"
    finalizeStats(): void
    {
        this._orgStatistics.addStatistic('SFA', this._numEmployees, this._numManagers, this._numICs);
    }

    /**
     * Retrieve the collector statistics
     *
     * @returns {OrgSummaryStatistics} the collector statistics
     */
    get statistics(): OrgSummaryStatistics
    {
        return this._orgStatistics;
    }
}

export {OrgSummaryStatisticsCollector, DefaultOrgSummaryStatistics, OrgSummaryStatistic};
export type {OrgSummaryStatistics};
