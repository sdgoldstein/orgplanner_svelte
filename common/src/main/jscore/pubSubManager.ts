/**
 * PubSubListener is an interface used for listening to pub sub events
 */

/**
 * PubSubEvent is an interface representing a single instance of an event
 */
/**
 * FIXME - Need a source on the pub sub event so that we can avoid oscillations/boomerangs
 * FIXME - Might also, in the future, need a listening scope, so that we can listen on a single orgstrcutre and not all
 * of them?
 */
interface PubSubEvent
{
    /**
     * Get the name of the event
     */
    readonly eventName: string;
}

interface PubSubListener
{
    /**
     * Handle a PubSubEvent
     *
     * @param eventName The name of the event
     * @param eventToHandle - The event to handle
     */
    onEvent(eventName: string, eventToHandle: PubSubEvent): void;
}

/**
 * Base implementation of a PubSubEvent
 */
class BasePubSubEvent implements PubSubEvent
{
    private readonly _eventName: string;

    /**
     * Create an event
     *
     * @param eventName name of the event
     */
    protected constructor(eventName: string)
    {
        this._eventName = eventName;
    }

    /**
     * Get the name of the event
     */
    public get eventName(): string
    {
        return this._eventName;
    }
}

/**
 * PubSubManager can be used to register/unregister event listeners and fire events
 */
class PubSubManager
{
    private static _singletonInstance: PubSubManager;
    private readonly _registeredListeners: Map<string, PubSubListener[]>;

    /**
     * Private constructor to enforce singleton pattern
     * @private
     */
    private constructor()
    {
        this._registeredListeners = new Map<string, PubSubListener[]>();
    }

    /**
     * Retrieve the PubSubManager singleton instance
     */
    public static get instance(): PubSubManager
    {
        if (!PubSubManager._singletonInstance)
        {
            PubSubManager._singletonInstance = new PubSubManager();
        }

        return PubSubManager._singletonInstance;
    }

    /**
     * Register an event listener
     *
     * @param eventName the name of the event for which to listen
     * @param listenerToRegister the listener to register
     */
    public registerListener(eventName: string, listenerToRegister: PubSubListener): void
    {
        let registeredListenerArray = this._registeredListeners.get(eventName);
        if (!registeredListenerArray)
        {
            registeredListenerArray = new Array<PubSubListener>();
            this._registeredListeners.set(eventName, registeredListenerArray);
        }

        registeredListenerArray.push(listenerToRegister);
    }

    /**
     * Unregister an event listener
     * @param eventName the name of the event for which to listen
     * @param listenerToUnregister the listener to register
     */
    unregisterListener(eventName: string, listenerToUnregister: PubSubListener): void
    {
        if (!this._registeredListeners.has(eventName))
        {
            throw new Error("unable to unregister listener.  Unknown event name, " + eventName);
        }

        const registeredListenerArray = this._registeredListeners.get(eventName);
        if (!registeredListenerArray)
        {
            throw new Error("No listeners defined for, " + eventName);
        }
        const index = registeredListenerArray.indexOf(listenerToUnregister);
        if (index > -1)
        {
            registeredListenerArray.splice(index, 1);
        }
        else
        {
            throw new Error("unable to unregister listener");
        }
    }

    /**
     * Fire an event
     * @param {PubSubEvent} eventToFire the event to fire
     */
    public fireEvent(eventToFire: PubSubEvent): void
    {
        const eventName: string = eventToFire.eventName;

        // Empty array returned if event name doesn't have listeners
        const registeredListenersArray: PubSubListener[] = this._registeredListeners.get(eventName) ?? [];
        registeredListenersArray.forEach(
            (nextListener: PubSubListener) => { nextListener.onEvent(eventName, eventToFire); });
    }
}

export {PubSubManager, BasePubSubEvent};
export type {PubSubListener, PubSubEvent};
