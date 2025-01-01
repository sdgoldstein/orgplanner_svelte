
interface ColumnDefinition
{
    columnName: string;
    columnLabel: string;
}

interface DataRow
{
    rowKey: string;

    getData(columnName: string): string;
}

type TableDataSource = Iterable<DataRow>;

const EMPTY_TABLE_DATA_SOURCE: TableDataSource = {
    [Symbol.iterator]() {
        return new EmptyIterator<DataRow>();
    }
}

class EmptyIterator<T> implements Iterator<T>
{
    next(): IteratorResult<T>
    {
        return {done : true, value : undefined};
    }
}

export type{TableDataSource, ColumnDefinition, DataRow, EMPTY_TABLE_DATA_SOURCE};
