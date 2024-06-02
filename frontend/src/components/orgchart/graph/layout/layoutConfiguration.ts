
interface LayoutConfiguration
{
    verticalSpacing: number;
    horizontalSpacing: number;
    childIndent: number;
    minCellWidth: number;
}

class DefaultLayoutConfiguration implements LayoutConfiguration
{
    private _verticalSpacing: number = 30;
    private _horizontalSpacing: number = 40;
    private _childIndent: number = 30;
    private _minCellWidth: number = 150;

    get verticalSpacing(): number{return this._verticalSpacing} get horizontalSpacing(): number
    {
        return this._horizontalSpacing;
    }

    get childIndent(): number
    {
        return this._childIndent;
    }

    get minCellWidth(): number
    {
        return this._minCellWidth;
    }
}

export {DefaultLayoutConfiguration};
export type {LayoutConfiguration};
