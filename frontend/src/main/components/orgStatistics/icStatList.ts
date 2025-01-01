import type {ICStatistic, ICStatistics} from "orgplanner-common/model";
import type {DataRow, TableDataSource} from "../ui/datatable/datatable";
import {StatListDataRowIterator} from "./statList";

class ICStatListConstants
{
    static readonly COLUMN_DEFINITIONS =
        [ {columnName : "ic.name", columnLabel: "Name"}, {columnName : "ic.title", columnLabel: "Title"} ];
}

class ICStatListTableDataSource implements TableDataSource
{
    constructor(private readonly _icStatistics: ICStatistics) {}

    [Symbol.iterator](): Iterator<DataRow>
    {
        return new ICStatListDataRowIterator(this._icStatistics.statistics);
    }
}

class ICStatListDataRowIterator extends StatListDataRowIterator<ICStatistic>
{
    constructor(icStatistics: ICStatistic[])
    {
        super(icStatistics);
    }
}

export {ICStatListTableDataSource, ICStatListConstants};