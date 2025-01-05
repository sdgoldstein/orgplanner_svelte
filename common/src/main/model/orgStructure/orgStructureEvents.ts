import {BasePubSubEvent, type PubSubEvent} from "orgplanner-common/jscore";
import type {OrgEntity} from "./orgEntity";

class OrgStructureChangedEvents
{
    public static readonly ORG_ENTITIES_ADDED: string = "ORG_ENTITIES_ADDED";
    public static readonly ORG_ENTITY_EDITED: string = "ORG_ENTITY_EDITED";
    public static readonly ORG_ENTITIES_REMOVED: string = "ORG_ENTITY_REMOVED";
    public static readonly ORG_ENTITIES_MOVED: string = "ORG_ENTITY_MOVED";
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

class OrgStructureChangedEventEntitiesMoved extends BasePubSubEvent
{
    constructor(public movedEntity: OrgEntity, public newParent: OrgEntity, public previousParent: OrgEntity)
    {
        super(OrgStructureChangedEvents.ORG_ENTITIES_MOVED)
    }
}

export {
    OrgStructureChangedEvents,
    OrgStructureChangedEventEntitiesAdded,
    OrgStructureChangedEventEntityEdited,
    OrgStructureChangedEventEntitiesRemoved,
    OrgStructureChangedEventEntitiesMoved
};
export type{OrgStructureChangedEvent};
