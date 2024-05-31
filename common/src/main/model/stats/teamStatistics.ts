import {Employee} from "../orgStructure/employee";
import {OrgStructureVisitor} from "../orgStructure/orgStructure";

/**
 * A TeamStatistic is an individual team statistic
 */
class TeamStatistic
{
    private readonly _title: string;
    private _numMembers: number;
    private _numICs: number;
    private _numManagers: number;

    /**
     * Create an insance of TeamStatistic
     *
     * @param {string} title the title of the team
     */
    constructor(title: string)
    {
        this._title = title;

        this._numMembers = 0;
        this._numICs = 0;
        this._numManagers = 0;
    }

    /**
     * Retrieve the team title
     *
     * @returns {string} the team title
     */
    get title(): string
    {
        return this._title;
    }

    /**
     * Add a member of the team
     *
     * @param {Employee} employee a member of the team
     */
    addMember(employee: Employee): void
    {
        if (!employee)
        {
            throw new Error("employee must be defined");
        }

        this._numMembers++;
        if (employee.isManager())
        {
            this._numManagers++;
        }
        else
        {
            this._numICs++;
        }
    }

    /**
     * Retrieve the nubmer of team members
     *
     * @returns {number} the nubmer of team members
     */
    get numMembers(): number
    {
        return this._numMembers;
    }

    /**
     * Retrieve the number of individual contributors
     * @returns {number} the number of individual contributors
     */
    get numICs(): number
    {
        return this._numICs;
    }

    /**
     * Retrieve the number of managers
     *
     * @returns {number} the number of managers
     */
    get numManagers(): number
    {
        return this._numManagers;
    }
}

/**
 * TeamStatistics contains all statistics related to scrum teams
 */
interface TeamStatistics
{
    // An array of individual team statistics
    readonly statistics: TeamStatistic[];
}

/**
 * Default implementation of the TeamStatistics interface
 */
class DefaultTeamStatistics implements TeamStatistics
{
    private _statistics: Map<string, TeamStatistic>;

    /**
     * Create an instance of DefaultTeamStastics
     */
    constructor()
    {
        this._statistics = new Map();
    }

    /**
     * Add an individual team statistic
     *
     * @param {ManagerStatistic} statisticToAdd the team statistic to add
     */
    addStatistic(employee: Employee): void
    {
        if (!employee)
        {
            throw new Error("ic must be defined");
        }

        const team = employee.team.title;
        let teamStat = this._statistics.get(team);
        if (!teamStat)
        {
            teamStat = new TeamStatistic(team);
            this._statistics.set(team, teamStat);
        }

        teamStat.addMember(employee);
    }

    get statistics(): TeamStatistic[]
    {
        return Array.from(this._statistics.values());
    }
}

/**
 * TeamStatisticCollector is used to collect statistics related to teams in an organization.  It
 * follows a visitor pattern to visit each node in the org tree
 */
class TeamStatisticsCollector implements OrgStructureVisitor
{
    private readonly _teamStatistics: DefaultTeamStatistics;

    /**
     * Create an instance of TeamsStatisticsCollector
     */
    constructor()
    {
        this._teamStatistics = new DefaultTeamStatistics();
    }

    visitEnter(employee: Employee): void
    {
        this._teamStatistics.addStatistic(employee);
    }

    visitLeave(employee: Employee): void
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
        // FIXME
    }

    /**
     * Retrieve the collector statistics
     *
     * @returns {ManagerStatistics} the collector statistics
     */
    get statistics(): TeamStatistics
    {
        return this._teamStatistics;
    }
}

export {TeamStatisticsCollector, DefaultTeamStatistics, TeamStatistic};
export type {TeamStatistics};
