/**
 * A Tree org structure.  The root node is a Dummy node that exists in every tree.  Child nodes can be added directly
 * to the root or to other existing nodes
 *
 * Node keys and node values can be any data type
 */

/**
 * Node represents ann individual node in the tree
 */
interface Node<K, V>
{
    readonly key: K;
    value: V;
    parent: Node<K, V>;
    readonly childrenIterator: IterableIterator<Node<K, V>>

        addChild(childNode: Node<K, V>): void;
    removeChild(childNode: Node<K, V>): void
}

class DefaultNode<K, V> implements Node<K, V>
{
    private readonly _key: K;
    private _value: V;
    private _parent: Node<K, V>|undefined;

    private _children: Node<K, V>[];

    constructor(key: K, value: V)
    {
        this._key = key;
        this._value = value;
        this._children = [];
    }

    get key(): K
    {
        return this._key;
    }

    get value(): V
    {
        return this._value;
    }

    set value(valueToSet: V)
    {
        this._value = valueToSet;
    }

    get parent(): Node<K, V>
    {
        if (!parent)
        {
            throw new Error("Attempt to retrieve parent before it's been set");
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this._parent!;
    }

    set parent(parentToSet: Node<K, V>)
    {
        this._parent = parentToSet;
    }

    addChild(childNode: Node<K, V>): void
    {
        // Set all state related on nodes
        this._children.push(childNode);
        childNode.parent = this;
    }

    removeChild(childNode: Node<K, V>): void
    {
        const index = this._children.indexOf(childNode);
        if (index === -1)
        {
            throw new Error("cannot remove child that does not exist");
        }
        this._children.splice(index, 1);

        //  FIXME - We can't set the parent to undefined here if we want Node to be safer.  Could be dangerous
        // childNode.parent = undefined;
    }

    get childrenIterator(): IterableIterator<Node<K, V>>
    {
        return this._children.values();
    }
}

class RootNode<K, V> implements Node<K, V>
{
    private _children: Node<K, V>[] = [];

    get key(): K
    {
        throw new Error("Root node does not have a key");
    }

    get value(): V
    {
        throw new Error("Root node does not have a value");
    }

    get parent(): Node<K, V>
    {
        throw new Error("Root node does not have a parent");
    }

    set parent(parentToSet: Node<K, V>)
    {
        throw new Error("Cannot set parent on oot node");
    }

    public addChild(childNode: Node<K, V>): void
    {
        this._children.push(childNode);
        childNode.parent = this;
    }

    removeChild(childNode: Node<K, V>): void
    {
        const index = this._children.indexOf(childNode);
        if (index === -1)
        {
            throw new Error("cannot remove child that does not exist");
        }
        this._children.splice(index, 1);

        //  FIXME - We can't set the parent to undefined here if we want Node to be safer.  Could be dangerous
        // childNode.parent = undefined;
    }

    get childrenIterator(): IterableIterator<Node<K, V>>
    {
        return this._children.values();
    }
}

class DummyValueNode<K, V> implements Node<K, V>
{
    private readonly _key: K;
    private _parent: Node<K, V>|undefined;

    private _children: Node<K, V>[] = [];

    constructor(key: K)
    {
        this._key = key;

        this._children = [];
    }

    get key(): K
    {
        return this._key;
    }

    get value(): V
    {
        throw new Error("Root node does not have a value");
    }

    get parent(): Node<K, V>
    {
        if (!parent)
        {
            throw new Error("Attempt to retrieve parent before it's been set");
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this._parent!;
    }

    set parent(parentToSet: Node<K, V>)
    {
        this._parent = parentToSet;
    }

    public addChild(childNode: Node<K, V>): void
    {
        this._children.push(childNode);
        childNode.parent = this;
    }

    removeChild(childNode: Node<K, V>): void
    {
        const index = this._children.indexOf(childNode);
        if (index === -1)
        {
            throw new Error("cannot remove child that does not exist");
        }
        this._children.splice(index, 1);

        //  FIXME - We can't set the parent to undefined here if we want Node to be safer.  Could be dangerous
        // childNode.parent = undefined;
    }

    get childrenIterator(): IterableIterator<Node<K, V>>
    {
        return this._children.values();
    }
}

/**
 * A visitor used to apply logic while traversing the nodes of the tree
 */
class TreeVisitor<K, V>
{
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    visitEnter(node: Node<K, V>): void
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    {
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    visitLeave(node: Node<K, V>): void
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    {
    }
}

/**
 * A queue implementation used to track state during traversal
 */
class Queue<T>
{
    private data: T[];

    constructor()
    {
        this.data = [];
    }

    enqueue(record: T): void
    {
        this.data.push(record);
    }

    dequeue(): T
    {
        if (this.data.length <= 0)
        {
            throw new Error("queue is empty");
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.data.shift()!;
    }

    public isEmpty(): boolean
    {
        return this.data.length <= 0;
    }
}

class Tree<K, V>
{
    private readonly _root: Node<K, V>;
    private nodeByKeyMap: Map<K, Node<K, V>>;

    /**
     * Create a tree structure
     */
    constructor()
    {
        this._root = new RootNode();
        this.nodeByKeyMap = new Map<K, Node<K, V>>();
        // this.nodeByKeyMap.set(this._root.key, this._root);
    }

    /**
     * Add a new node to the tree
     *
     * @param nodeKey the node key of the new node
     * @param nodeValue the node value of the new node
     */
    addOrphanNode(nodeKey: K, nodeValue: V): void
    {
        this.addNodeToParent(nodeKey, nodeValue, this._root);
    }

    /**
     * Add a new node to the tree with the specified parent node.
     *
     * @param nodeKey the node key of the new node
     * @param nodeValue the node value of the new node
     * @param parentNodeKey the node key of the parent node that must exist in the tree. If it doesn't, an Error is
     *     thrown
     */
    addNode(nodeKey: K, nodeValue: V, parentNodeKey: K): void
    {
        // eslint-disable-next-line init-declarations
        let parentNode: Node<K, V>;

        // Check if parent node exists
        if (!this.nodeByKeyMap.has(parentNodeKey))
        {
            // Create a dummy node
            parentNode = new DummyValueNode<K, V>(parentNodeKey);
            this._root.addChild(parentNode);
            this.nodeByKeyMap.set(parentNodeKey, parentNode);
        }

        // Existence in Map has been confirmed, so can use non-nul assertion
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        parentNode = this.nodeByKeyMap.get(parentNodeKey)!;

        this.addNodeToParent(nodeKey, nodeValue, parentNode);
    }

    private addNodeToParent(nodeKey: K, nodeValue: V, parentNode: Node<K, V>): void
    {
        const nodeToAdd: Node<K, V> = new DefaultNode<K, V>(nodeKey, nodeValue);
        parentNode.addChild(nodeToAdd);

        if (this.nodeByKeyMap.has(nodeKey))
        {
            const duplicateNode = this.nodeByKeyMap.get(nodeKey);
            if (duplicateNode instanceof DummyValueNode)
            {
                for (const nextChild of duplicateNode.childrenIterator)
                {
                    nodeToAdd.addChild(nextChild);
                }

                this._root.removeChild(duplicateNode);
                this.nodeByKeyMap.delete(nodeKey);
            }
            else
            {
                throw new Error("Added duplicate node with key, " + nodeKey);
            }
        }

        this.nodeByKeyMap.set(nodeKey, nodeToAdd);
    }

    /**
     * Move the node with the give key to the parent node for the given parent key
     *
     * @param {string} nodeToMoveKey the key of the node to move
     * @param {string} parentNodeKey the key of the new parent node
     */
    public moveNodeToParent(nodeToMoveKey: K, parentNodeKey: K): void
    {
        if (!this.nodeByKeyMap.has(nodeToMoveKey))
        {
            throw new Error("node with key, " + nodeToMoveKey + ", not found.");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nodeToMove: Node<K, V> = this.nodeByKeyMap.get(nodeToMoveKey)!;

        if (!this.nodeByKeyMap.has(parentNodeKey))
        {
            throw new Error("node with key, " + parentNodeKey + ", not found.");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const parentNode: Node<K, V> = this.nodeByKeyMap.get(parentNodeKey)!;

        const currentParent = nodeToMove.parent;
        currentParent.removeChild(nodeToMove);
        parentNode.addChild(nodeToMove);
    }

    /**
     * Perform a depth first traversal of this tree
     *
     * @param {TreeVisitor} treeVisitor a visitor to apply logic during the traversal
     */
    traverseDF(treeVisitor: TreeVisitor<K, V>): void
    {
        if (!treeVisitor)
        {
            throw new Error("visitor cannot be null");
        }

        // this is a recurse and immediately-invoking function
        // Helps make the function private
        (function recurseDF(currentNode): void {
            if (!(currentNode instanceof DummyValueNode) && !(currentNode instanceof RootNode))
            {
                treeVisitor.visitEnter(currentNode);
            }

            for (const nextChildNode of currentNode.childrenIterator)
            {
                recurseDF(nextChildNode);
            }

            if (!(currentNode instanceof DummyValueNode) && !(currentNode instanceof RootNode))
            {
                treeVisitor.visitLeave(currentNode);
            }
        })(this._root);
    }

    /**
     * Perform a breadth first traversal of this tree
     *
     * @param {TreeVisitor} treeVisitor a visitor to apply logic during the traversal
     */
    traverseBF(treeVisitor: TreeVisitor<K, V>): void
    {
        this.traverseBFImpl(treeVisitor, this._root);
    }

    /**
     * Perform a partial breadth first traversal of this tree starting at the given node
     * @param {TreeVisitor} treeVisitor a visitor to apply logic during the traversal
     * @param {string} nodeKey the key of the node represting the starting point of the traversal
     */
    partialTraverseBF(treeVisitor: TreeVisitor<K, V>, nodeKey: K): void
    {
        if (!this.nodeByKeyMap.has(nodeKey))
        {
            throw new Error("node for node key, " + nodeKey + "does not exist");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.traverseBFImpl(treeVisitor, this.nodeByKeyMap.get(nodeKey)!);
    }

    private traverseBFImpl(treeVisitor: TreeVisitor<K, V>, startNode: Node<K, V>): void
    {
        if (!treeVisitor)
        {
            throw new Error("visitor cannot be null");
        }

        const queue = new Queue();
        queue.enqueue(startNode);
        let nextNode: Node<K, V> = startNode; // initialize so that we dont need to declare undefined
        do
        {
            nextNode = queue.dequeue() as Node<K, V>;

            // FIXME - We shouldnt need nodeToProcess variable
            const nodeToProcess = nextNode;
            for (const nextChildNode of nodeToProcess.childrenIterator)
            {
                queue.enqueue(nextChildNode);
            }

            // FIXME _ HERE - Is there an enter and leave in this case????
            if (!(nodeToProcess instanceof DummyValueNode) && !(nodeToProcess instanceof RootNode))
            {
                treeVisitor.visitEnter(nodeToProcess);
            }

            if (!(nodeToProcess instanceof DummyValueNode) && !(nodeToProcess instanceof RootNode))
            {
                treeVisitor.visitLeave(nodeToProcess);
            }
        } while (!queue.isEmpty());
    }

    /**
     * Remove the specified nodes from the tree
     *
     * @param {any[]} nodeKeys an array of keys of the nodes to ve removed
     */
    removeNodes(nodeKeys: K[]): void
    {
        nodeKeys.forEach((nextNodeId) => {
            if (this.nodeByKeyMap.has(nextNodeId))
            {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const nextNode: Node<K, V> = this.nodeByKeyMap.get(nextNodeId)!;
                this.removeRecursively(nextNode);
            }
        });
    }

    /**
     * Determine if this tree is empty
     *
     * @returns {boolean} true if it's empty; false otherwise
     */
    isEmpty(): boolean
    {
        return this.nodeByKeyMap.size === 0;
    }

    private removeRecursively(nodeToRemove: Node<K, V>): void
    {
        const parentNode = nodeToRemove.parent;
        if (parentNode)
        {
            parentNode.removeChild(nodeToRemove);
        }

        this.nodeByKeyMap.delete(nodeToRemove.key);
        const childNodesIterator = nodeToRemove.childrenIterator;
        let nextChildTuple = childNodesIterator.next();
        while (!nextChildTuple.done)
        {
            this.removeRecursively(nextChildTuple.value);
            nextChildTuple = childNodesIterator.next();
        }
    }

    /**
     * Replace the node value of the node with the specified key
     *
     * @param nodeKey the key of the node for which the value will be replaced
     * @param nodeValue the new node value
     */
    replaceNodeValue(nodeKey: K, nodeValue: V): void
    {
        if (!this.nodeByKeyMap.has(nodeKey))
        {
            throw new Error("node for node key, " + nodeKey + "does not exist");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nodeToModify: Node<K, V> = this.nodeByKeyMap.get(nodeKey)!;
        nodeToModify.value = nodeValue;
    }
}

export {Tree, TreeVisitor};
export type {Node};
