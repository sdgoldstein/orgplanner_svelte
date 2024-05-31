import {Employee} from "../orgStructure/employee";
import {OrgStructure, OrgStructureVisitor} from "../orgStructure/orgStructure";

import {ICStatistics, ICStatisticsCollector} from "./icStatistics";
import {ManagerStatistics, ManagerStatisticsCollector} from "./managerStatistics";
import {OrgStatistics} from "./orgStatistics";
import {OrgSummaryStatistics, OrgSummaryStatisticsCollector} from "./orgSummaryStatistics";
import {TeamStatistics, TeamStatisticsCollector} from "./teamStatistics";

/**
 * An org structure visitor that traversing an org structure to collect stats
 */
class StatsCollectingOrgStructureVisitor implements OrgStructureVisitor
{
    private _managerStatisticsCollection: ManagerStatisticsCollector;
    private _icStatisticsCollection: ICStatisticsCollector;
    private _teamStatisticsCollection: TeamStatisticsCollector;
    private _orgStatisticsCollection: OrgSummaryStatisticsCollector;

    constructor()
    {
        this._managerStatisticsCollection = new ManagerStatisticsCollector();
        this._icStatisticsCollection = new ICStatisticsCollector();
        this._teamStatisticsCollection = new TeamStatisticsCollector();
        this._orgStatisticsCollection = new OrgSummaryStatisticsCollector();
    }

    /**
     * Retrieve the manager statistics that were collected
     *
     * @returns {ManagerStatistics} the manager statistics that were collected
     */
    get managerStatistics(): ManagerStatistics
    {
        return this._managerStatisticsCollection.statistics;
    }

    /**
     * Retrieve the individual contributor statistics that were collected
     *
     * @returns {ICStatistics} the individual contributor statistics that were collected
     */
    get icStatistics(): ICStatistics
    {
        return this._icStatisticsCollection.statistics;
    }

    /**
     * Retrieve the team statistics that were collected
     *
     * @returns {TeamStatistics} the team statistics that were collected
     */
    get teamStatistics(): TeamStatistics
    {
        return this._teamStatisticsCollection.statistics;
    }

    /**
     * Retrieve the org summary statistics that were collected
     *
     * @returns {OrgSummaryStatistics} the org summary statistics that were collected
     */
    get orgStatistics(): OrgSummaryStatistics
    {
        return this._orgStatisticsCollection.statistics;
    }

    visitEnter(employee: Employee): void
    {
        this._icStatisticsCollection.visitEnter(employee);
        this._managerStatisticsCollection.visitEnter(employee);
        this._teamStatisticsCollection.visitEnter(employee);
        this._orgStatisticsCollection.visitEnter(employee);
    }

    visitLeave(employee: Employee): void
    {
        this._managerStatisticsCollection.visitLeave(employee);
        this._icStatisticsCollection.visitLeave(employee);
        this._teamStatisticsCollection.visitLeave(employee);
        this._orgStatisticsCollection.visitLeave(employee);
    }

    finalizeStats(): void
    {
        this._managerStatisticsCollection.finalizeStats();
        this._teamStatisticsCollection.finalizeStats();
        this._orgStatisticsCollection.finalizeStats();
    }
}

/**
 * Default implementation of OrgStatistics
 */
class DefaultOrgStatistics implements OrgStatistics
{
    private readonly _managerStatistics: ManagerStatistics;
    private readonly _icStatistics: ICStatistics;
    private readonly _teamStatistics: TeamStatistics;
    private readonly _orgSummaryStatistics: OrgSummaryStatistics;

    constructor(orgSummaryStatistics: OrgSummaryStatistics, teamStatistics: TeamStatistics,
                managerStatistics: ManagerStatistics, icStatistics: ICStatistics)
    {
        this._managerStatistics = managerStatistics;
        this._icStatistics = icStatistics;
        this._teamStatistics = teamStatistics;
        this._orgSummaryStatistics = orgSummaryStatistics;
    }

    get icStatistics(): ICStatistics
    {
        return this._icStatistics;
    }

    get managerStatistics(): ManagerStatistics
    {
        return this._managerStatistics;
    }

    get orgSummaryStatistics(): OrgSummaryStatistics
    {
        return this._orgSummaryStatistics;
    }

    get teamStatistics(): TeamStatistics
    {
        return this._teamStatistics;
    }
}

/**
 * A StatsCollector is used to collect all org statistics
 */
class StatsCollector
{
    private static _singletonInstance: StatsCollector;

    /**
     * Private constructor to enforce singleton pattern
     * @private
     */
    private constructor()
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    {
    }

    /**
     * Retrieve the PubSubManager singleton instance
     */
    public static get instance(): StatsCollector
    {
        if (!StatsCollector._singletonInstance)
        {
            StatsCollector._singletonInstance = new StatsCollector();
        }

        return StatsCollector._singletonInstance;
    }

    /**
     * Collect statistics for the provided org structure
     *
     * FIXME - should be async
     *
     * @param {OrgStructure} orgStructure the org structure for which to collect statistcs
     */
    collectStats(orgStructure: OrgStructure): OrgStatistics
    {
        if (!orgStructure)
        {
            throw new Error("orgStructure cannot be null");
        }

        const statsCollectorVisitor = new StatsCollectingOrgStructureVisitor();

        orgStructure.traverseDF(statsCollectorVisitor);
        statsCollectorVisitor.finalizeStats();

        return new DefaultOrgStatistics(statsCollectorVisitor.orgStatistics, statsCollectorVisitor.teamStatistics,
                                        statsCollectorVisitor.managerStatistics, statsCollectorVisitor.icStatistics);
    }
}

export {StatsCollector, DefaultOrgStatistics};
