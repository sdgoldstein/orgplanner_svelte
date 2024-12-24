import {Cell, Rectangle} from "@maxgraph/core";

// Not all of these items should be on the interface.  Might need to create an internal interface in the future
interface NodeLayoutMetadata
{
    readonly cell: Cell;
    readonly childNodes: NodeLayoutMetadata[];
    hasHiddenChildren: boolean;

    // Ideally, this couldn't be null.  But, with lead nodes, the parent isn't always the parent cell, so setting it on
    // construction is no possible
    parentNode: NodeLayoutMetadata|null;

    height: number;
    width: number;

    xAdjustment: number;
    relativeY: number;
    relativeX: number;

    leftContour: number[];
    rightContour: number[];

    isRoot(): boolean;
    addChildNode(leafNodeMetadata: NodeLayoutMetadata): void;
    prependChildNode(leafNodeMetadata: NodeLayoutMetadata): void;
    getLeftContourWithAdjustment(xAdjustment: number): number[];
    getRightContourWithAdjustment(xAdjustment: number): number[];
    resetContours(): void;
}

abstract class BaseNodeLayoutMetadata implements NodeLayoutMetadata
{
    private readonly _cell: Cell;
    private readonly _childNodes: NodeLayoutMetadata[];
    private _parentNode: NodeLayoutMetadata|null;

    private _width: number;
    private _height: number;

    private _relativeX: number;
    private _relativeY: number;
    private _xAdjustment: number;
    private _leftContour: number[];
    private _rightContour: number[];
    private _hadHiddenChildren: boolean;

    constructor(cell: Cell, bounds: Rectangle)
    {
        this._cell = cell;
        this._width = bounds.width;
        this._height = bounds.height;
        this._relativeY = -1;
        this._relativeX = -1;
        this._xAdjustment = 0;
        this._childNodes = [];
        this._leftContour = [];
        this._rightContour = [];
        this._parentNode = null;
        this._hadHiddenChildren = false;
    }

    addChildNode(childNodeMetadata: NodeLayoutMetadata)
    {
        this.childNodes.push(childNodeMetadata);
        childNodeMetadata.parentNode = this;

        // reset cached contours
        this.resetContours();
    }

    prependChildNode(childNodeMetadata: NodeLayoutMetadata): void
    {
        this.childNodes.unshift(childNodeMetadata);
        childNodeMetadata.parentNode = this;

        // reset cached contours
        this.resetContours();
    }

    get childNodes()
    {
        return this._childNodes;
    }

    hasChildNodes()
    {
        return (this.childNodes.length != 0);
    }

    get hasHiddenChildren(): boolean
    {
        return this._hadHiddenChildren;
    }

    set hasHiddenChildren(value: boolean)
    {
        this._hadHiddenChildren = value;
    }

    public get parentNode(): NodeLayoutMetadata|null
    {
        return this._parentNode;
    }

    public set parentNode(parentNode: NodeLayoutMetadata|null)
    {
        this._parentNode = parentNode
    }

    isRoot(): boolean
    {
        return (this.parentNode == null);
    }

    get relativeX()
    {
        return this._relativeX;
    }

    set relativeX(relativeX: number)
    {
        this._relativeX = relativeX;

        this.resetContours();
    }

    get relativeY()
    {
        return this._relativeY;
    }

    set relativeY(relativeY: number)
    {
        this._relativeY = relativeY;
    }

    get xAdjustment(): number
    {
        return this._xAdjustment;
    }

    set xAdjustment(value: number)
    {
        this._xAdjustment = value;

        this.resetContours();
    }

    get width(): number
    {
        return this._width;
    }

    set width(widthToSet: number)
    {
        this._width = widthToSet;
    }

    get height(): number
    {
        return this._height;
    }

    get cell()
    {
        return this._cell;
    }

    get leftContour()
    {
        if (this._leftContour.length == 0)
        {
            this._leftContour.push(this.relativeX);
            const childLeftContour: number[] = [];
            for (const childNode of this._childNodes)
            {
                const nextChildLeftContour = childNode.getLeftContourWithAdjustment(this.xAdjustment);
                const maxContourLength = Math.max(childLeftContour.length, nextChildLeftContour.length);

                // Compare two arrays and take the max of each index
                for (let i = 0; i < maxContourLength; i++)
                {
                    if (childLeftContour.length > i)
                    {
                        if (nextChildLeftContour.length > i)
                        {
                            childLeftContour[i] = Math.min(childLeftContour[i], nextChildLeftContour[i]);
                        }
                    }

                    else
                    {
                        // next child left contour goes to deeper levels
                        childLeftContour.push(nextChildLeftContour[i]);
                    }
                }
            }

            this._leftContour = this._leftContour.concat(childLeftContour);
        }

        return this._leftContour;
    }

    getLeftContourWithAdjustment(xAdjustment: number)
    {
        return this.leftContour.map(x => x + xAdjustment);
    }

    get rightContour()
    {
        // The right contour must include node width
        if (this._rightContour.length == 0)
        {
            this._rightContour.push(this.relativeX + this.width);
            const childRightContour: number[] = [];
            for (const childNode of this._childNodes)
            {
                const nextChildRightContour = childNode.getRightContourWithAdjustment(this.xAdjustment);
                const maxContourLength = Math.max(childRightContour.length, nextChildRightContour.length);

                // Compare two arrays and take the max of each index
                for (let i = 0; i < maxContourLength; i++)
                {
                    if (childRightContour.length > i)
                    {
                        if (nextChildRightContour.length > i)
                        {
                            childRightContour[i] = Math.max(childRightContour[i], nextChildRightContour[i]);
                        }
                    }

                    else
                    {
                        // next child right contour goes to deeper levels
                        childRightContour[i] = nextChildRightContour[i];
                    }
                }
            }

            this._rightContour = this._rightContour.concat(childRightContour);
        }

        return this._rightContour;
    }

    getRightContourWithAdjustment(xAdjustment: number)
    {
        return this.rightContour.map(x => x + xAdjustment);
    }

    resetContours()
    {
        this._leftContour = [];
        this._rightContour = [];

        const parentNode = this.parentNode;
        if (parentNode)
        {
            parentNode.resetContours();
        }
    }
}

class DefaultNodeLayoutMetadata extends BaseNodeLayoutMetadata
{
    constructor(cell: Cell, bounds: Rectangle)
    {
        super(cell, bounds);
    }
}

class LeafWrapperNodeMetadata extends BaseNodeLayoutMetadata
{
    private __maxWidth: number;
    private _verticalSpacing: number;

    constructor(cell: Cell, bounds: Rectangle, verticalSpacing: number)
    {
        super(cell, bounds);
        this.__maxWidth = this.width;
        this._verticalSpacing = verticalSpacing;
    }

    addChildNode(childNodeData: NodeLayoutMetadata)
    {
        if (childNodeData.width > this.__maxWidth)
        {
            this.__maxWidth = childNodeData.width;
            this.width = this.__maxWidth;
            this.childNodes.forEach(nextChildNode => {nextChildNode.width = this.__maxWidth});

            // This is a bit of a hack.  For aesthetic reasons, parent should be as least as wide as leaf nodes
            if ((this.parentNode) && (this.parentNode.width < this.__maxWidth))
            {
                this.parentNode.width = this.__maxWidth;
            }
        }
        else
        {
            childNodeData.width = this.__maxWidth;
        }

        this.childNodes.push(childNodeData);
        childNodeData.parentNode = this;

        // reset cached contours
        this.resetContours();
    }

    get leftContour()
    {
        // Need to add the X for every row the leaf nodes are taking up
        const numberOfRowsOccupied = this.getNumberOfRowsOccupied();

        const leftContour = [];
        for (let i = 0; i < numberOfRowsOccupied; i++)
        {
            leftContour.push(this.relativeX);
        }

        return leftContour;
    }

    get rightContour()
    {
        // Need to add the X for every row the leaf nodes are taking up
        const numberOfRowsOccupied = this.getNumberOfRowsOccupied();

        // The right contour must include node width
        const rightContour = [];

        for (let i = 0; i < numberOfRowsOccupied; i++)
        {
            rightContour.push(this.relativeX + this.__maxWidth);
        }

        return rightContour;
    }

    private getNumberOfRowsOccupied()
    {
        const singleChildVerticalSpace = this.height + this._verticalSpacing / 2;
        return Math.ceil((singleChildVerticalSpace * this.childNodes.length) / (this.height + this._verticalSpacing));
    }
}

export {BaseNodeLayoutMetadata, DefaultNodeLayoutMetadata, LeafWrapperNodeMetadata};
export type{NodeLayoutMetadata};
