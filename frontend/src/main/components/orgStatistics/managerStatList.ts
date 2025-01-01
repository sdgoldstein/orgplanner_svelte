import {ManagerStatistic, type ManagerStatistics} from "orgplanner-common/model";
import type {DataRow, TableDataSource} from "../ui/datatable/datatable";
import {StatListDataRowIterator} from "./statList";

class ManagerStatListConstants
{
    static readonly COLUMN_DEFINITIONS = [
        {columnName : "manager.name", columnLabel: "Name"},
        {columnName : "manager.title", columnLabel: "Title"},
        {columnName : "numManagers", columnLabel: "# of Managers"},
        {columnName : "numDirects", columnLabel: "# of Directs"},
        {columnName : "numReports", columnLabel: "# of Reports"},
        {columnName : "managerToICRatio", columnLabel: "Manager Ratio"},
    ];
}

class ManagerStatListTableDataSource implements TableDataSource
{
    constructor(private readonly _managerStatistics: ManagerStatistics) {}

    [Symbol.iterator](): Iterator<DataRow>
    {
        return new ManagerStatListDataRowIterator(this._managerStatistics.statistics);
    }
}

class ManagerStatListDataRowIterator extends StatListDataRowIterator<ManagerStatistic>
{
    constructor(managerStatistics: ManagerStatistic[])
    {
        super(managerStatistics);
    }
}

export {ManagerStatListTableDataSource, ManagerStatListConstants};