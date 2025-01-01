import {OrgSummaryStatistic, type OrgSummaryStatistics} from "orgplanner-common/model";
import type {DataRow, TableDataSource} from "../ui/datatable/datatable";
import {StatListDataRowIterator} from "./statList";

class OrgSummaryStatListConstants
{
    static readonly COLUMN_DEFINITIONS = [
        {columnName : "numEmployees", columnLabel: "# of Employees"},
        {columnName : "numManagers", columnLabel: "# of Managers"},
        {columnName : "numICs", columnLabel: "# of ICs"},
        {columnName : "managerToICRatio", columnLabel: "# of Manager Ratio"},
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