/**
 * A stack data structure
 */
interface Stack<T>
{
    // Get the number of items currently in the stack
    readonly size: number;

    /**
     * Push a value on the stack
     * @param value the value to push
     */
    push(value: T): void;

    /**
     * Pop a value on the stack
     * @returns {T} the value on the top of the stack
     */
    pop(): T;

    /**
     * Peek at the top value on the stack
     * @returns {T} the top valeu on the stask
     */
    peek(): T;

    /**
     * Determine if this stack is empty
     * @returns {boolean} true if the stack is empty; false otherwise
     */
    isEmpty(): boolean;
}

/**
 * An array implementation of a stack
 *
 * Based on this article: https://initjs.org/data-structure-stack-in-javascript-714f45dbf889
 *
 *  The article states this about not using using an array for storage:
 *
 *  1.  Most methods on the Array Prototype have a time complexity of O(n). Let’s look at a specific example like
 * splice(). When you splice an array, it has to find the specific index, remove a specified number of elements, then
 * shift all the following elements forward to fill the place of the removed elements. Contrast this with using the
 * stack (object) which has direct look-up of properties and does not have to be kept ‘in-order’.
 *  2.  Arrays take up a block of space because they have to keep their order, where as an object does not.
 */
class SimpleStack<T> implements Stack<T>
{
    private _size: number;
    private readonly _storage: T[];

    /**
     * Create a single stack
     */
    constructor()
    {
        this._size = 0;
        this._storage = [];
    }

    push(value: T): void
    {
        this._storage[this._size] = value;
        this._size++;
    }

    pop(): T
    {
        // Check to see if the stack is empty
        if (this._size === 0)
        {
            throw new Error("Stack is empty");
        }

        this._size--;
        const result = this._storage[this._size];
        delete this._storage[this._size];
        return result;
    }

    peek(): T
    {
        if (this._size === 0)
        {
            throw new Error("Stack is empty");
        }

        return this._storage[this._size - 1];
    }

    isEmpty(): boolean
    {
        return this._size === 0;
    }

    get size(): number
    {
        return this._size;
    }
}

export {SimpleStack};
export type {Stack};
