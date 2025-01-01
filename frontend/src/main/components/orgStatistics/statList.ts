
import type {DataRow} from "../ui/datatable/datatable";

class StatListDataRowIterator<T> implements Iterator<DataRow>
{
    private _index = 0;

    constructor(private statistics: T[]) {}

    next(): IteratorResult<DataRow>
    {
        const done = this.index >= this.statistics.length;
        const value = new StatListDataRow(this.index.toString(), this.statistics[this.index]);
        this._index++;

        return {done, value};
    }

    private get index(): number
    {
        return this._index;
    }
}

class StatListDataRow<T> implements DataRow
{
    constructor(public rowKey: string, private readonly _data: T) {}

    getData(columnName: string): string
    {
        let currentValue: any = this._data;
        const columnNameSegments = columnName.split(".");

        for (const nextColumnNameSegment of columnNameSegments)
        {
            currentValue = currentValue[nextColumnNameSegment];
            if (currentValue === undefined || currentValue === null)
            {
                throw new Error(`Could not find nested property ${columnName}`);
            }
        }
        return currentValue.toString();
    }
}

export {StatListDataRow, StatListDataRowIterator};