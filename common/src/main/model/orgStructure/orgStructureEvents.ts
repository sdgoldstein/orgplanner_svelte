import {BasePubSubEvent, type PubSubEvent} from "orgplanner-common/jscore";
import type {OrgEntity} from "./orgEntity";

class OrgStructureChangedEvents
{
    public static readonly ORG_ENTITIES_ADDED: string = "ORG_ENTITIES_ADDED";
    public static readonly ORG_ENTITY_EDITED: string = "ORG_ENTITY_EDITED";
    public static readonly ORG_ENTITIES_REMOVED: string = "ORG_ENTITY_REMOVED";
}

interface OrgStructureChangedEvent extends PubSubEvent
{
}

class OrgStructureChangedEventEntitiesAdded extends BasePubSubEvent
{
    constructor(public entitiesAded: OrgEntity[])
    {
        super(OrgStructureChangedEvents.ORG_ENTITIES_ADDED)
    }
}

class OrgStructureChangedEventEntityEdited extends BasePubSubEvent
{
    constructor(public entityEdited: OrgEntity)
    {
        super(OrgStructureChangedEvents.ORG_ENTITY_EDITED)
    }
}

class OrgStructureChangedEventEntitiesRemoved extends BasePubSubEvent
{
    constructor(public entitiesRemoved: OrgEntity[])
    {
        super(OrgStructureChangedEvents.ORG_ENTITIES_REMOVED)
    }
}

export {
    OrgStructureChangedEvents,
    OrgStructureChangedEventEntitiesAdded,
    OrgStructureChangedEventEntityEdited,
    OrgStructureChangedEventEntitiesRemoved
};
export type{OrgStructureChangedEvent};
