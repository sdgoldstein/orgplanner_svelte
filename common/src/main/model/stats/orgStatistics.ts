import type {ICStatistics} from "./icStatistics";
import type {ManagerStatistics} from "./managerStatistics";
import type {OrgSummaryStatistics} from "./orgSummaryStatistics";
import type {TeamStatistics} from "./teamStatistics";

/**
 * OrgStatistics hold all statistics associated with an Organization
 */
interface OrgStatistics
{
    /**
     * Get the manager related statistics
     */
    readonly managerStatistics: ManagerStatistics;

    /**
     * Get the individual contributor statistics
     */
    readonly icStatistics: ICStatistics;

    /**
     * Get the team statistics
     */
    readonly teamStatistics: TeamStatistics;

    /**
     * Get the organization summary statistics
     */
    readonly orgSummaryStatistics: OrgSummaryStatistics;
}

export type{OrgStatistics};