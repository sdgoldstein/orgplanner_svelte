import type {GuardedMap} from "@kameleon/tscore/jscore";
import {BasePubSubEvent} from "orgplanner-common/jscore";
import {type OrgEntityPropertyDescriptor, type OrgEntityType, OrgEntityTypes} from "orgplanner-common/model";

import {OrgPlannerAppEvents} from "../app/orgPlannerAppEvents";

type ViewToggableEntity = OrgEntityPropertyDescriptor|OrgEntityType;

class ViewToggableEntityToggledEvent extends BasePubSubEvent
{
    constructor(private _toggledEntity: ViewToggableEntity, private _newState: boolean)
    {
        super(OrgPlannerAppEvents.VIEW_TOGGABLE_ENTITY_TOGGLED);
    }

    getNewState(): boolean
    {
        return this._newState;
    }

    getViewToggableEntity(): ViewToggableEntity
    {
        return this._toggledEntity;
    }
}

interface OrgChartEntityVisibleState
{
    isVisible(entity: ViewToggableEntity): boolean;
    setVisible(entity: ViewToggableEntity, visible: boolean): void;
    iterator(): IterableIterator<ViewToggableEntity>;
}

class OrgChartEntityVisibleStateImpl implements OrgChartEntityVisibleState
{
    private _viewState: GuardedMap<ViewToggableEntity, boolean> = new Map();

    constructor(propertyDescriptors: Set<OrgEntityPropertyDescriptor>)
    {
        this._viewState.set(OrgEntityTypes.MANAGER, true);
        this._viewState.set(OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR, true);
        this._viewState.set(OrgEntityTypes.TEAM, true);

        for (const nextPropertyDescriptor of propertyDescriptors)
        {
            this._viewState.set(nextPropertyDescriptor, true)
        }
    }

    isVisible(entity: ViewToggableEntity): boolean
    {
        if (!this._viewState.has(entity))
        {
            throw new Error("Invalid parameter, " + entity);
        }
        return this._viewState.get(entity);
    }

    setVisible(entity: ViewToggableEntity, visible: boolean): void
    {
        this._viewState.set(entity, visible);
    }

    iterator(): IterableIterator<ViewToggableEntity>
    {
        throw new Error('Method not implemented.');
    }
}

enum OrgChartMode {
    READ_ONLY = "READ_ONLY",
    PLANNING = "PLANNING",
    PRINT = "PRINT"
}

export type {OrgChartEntityVisibleState, ViewToggableEntity};
export {OrgChartEntityVisibleStateImpl, OrgChartMode, ViewToggableEntityToggledEvent};
