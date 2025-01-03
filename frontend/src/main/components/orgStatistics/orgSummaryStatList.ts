import {OrgSummaryStatistic, type OrgSummaryStatistics} from "orgplanner-common/model";
import type {DataRow, TableDataSource} from "../ui/datatable/datatable";
import {StatListDataRowIterator} from "./statList";

class OrgSummaryStatListConstants
{
    static readonly COLUMN_DEFINITIONS = [
        {columnName : "numEmployees", columnLabel: "Employees"},
        {columnName : "numManagers", columnLabel: "Managers"},
        {columnName : "numICs", columnLabel: "ICs"},
        {columnName : "managerToICRatio", columnLabel: "Manager Ratio"},
    ];
}

class OrgSummaryStatListTableDataSource implements TableDataSource
{
    constructor(private readonly _orgSummaryStatistics: OrgSummaryStatistics) {}

    [Symbol.iterator](): Iterator<DataRow>
    {
        return new OrgSummaryStatListDataRowIterator(this._orgSummaryStatistics.statistics);
    }
}

class OrgSummaryStatListDataRowIterator extends StatListDataRowIterator<OrgSummaryStatistic>
{
    constructor(orgSummaryStatistics: OrgSummaryStatistic[])
    {
        super(orgSummaryStatistics);
    }
}

export {OrgSummaryStatListTableDataSource, OrgSummaryStatListConstants};