import {TeamStatistic, type TeamStatistics} from "orgplanner-common/model";
import type {DataRow, TableDataSource} from "@sphyrna/uicomponents";
import {StatListDataRowIterator} from "./statList";

class TeamStatListConstants
{
    static readonly COLUMN_DEFINITIONS = [
        {columnName : "title", columnLabel: "Name"},
        {columnName : "numMembers", columnLabel: "Members"},
        {columnName : "numICs", columnLabel: "Engineers"},
        {columnName : "numManagers", columnLabel: "Managers"},
    ];
}

class TeamStatListTableDataSource implements TableDataSource
{
    constructor(private readonly _teamStatistics: TeamStatistics) {}

    [Symbol.iterator](): Iterator<DataRow>
    {
        return new TeamStatListDataRowIterator(this._teamStatistics.statistics);
    }
}

class TeamStatListDataRowIterator extends StatListDataRowIterator<TeamStatistic>
{
    constructor(teamStatistics: TeamStatistic[])
    {
        super(teamStatistics);
    }
}

export {TeamStatListTableDataSource, TeamStatListConstants};