import {TeamStatistic, type TeamStatistics} from "orgplanner-common/model";
import type {DataRow, TableDataSource} from "../ui/datatable/datatable";
import {StatListDataRowIterator} from "./statList";

class TeamStatListConstants
{
    static readonly COLUMN_DEFINITIONS = [
        {columnName : "title", columnLabel: "Name"},
        {columnName : "numMembers", columnLabel: "# of Members"},
        {columnName : "numICs", columnLabel: "# of Engineers"},
        {columnName : "numManagers", columnLabel: "# of Managers"},
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