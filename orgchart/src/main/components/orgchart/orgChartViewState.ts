import {BasePubSubEvent} from "orgplanner-common/jscore";
import {
    type OrgEntityPropertyDescriptor,
    OrgEntityPropertyDescriptorImpl,
    type OrgEntityType,
    OrgEntityTypes
} from "orgplanner-common/model";
import {OrgChartEvents} from "./OrgChartEvents";

type ViewToggableEntity = OrgEntityPropertyDescriptor|OrgEntityType;

// FIXME - Probably need to create another type besides OrgEntityPropertyDescriptor and add it to ViewToggaleEntity list
class FixedOrgEntityPropertyDescriptors
{
    static readonly TITLE: OrgEntityPropertyDescriptor =
        new OrgEntityPropertyDescriptorImpl("TITLE", "Title", "Employee", true);
    static readonly TEAM_TITLE: OrgEntityPropertyDescriptor =
        new OrgEntityPropertyDescriptorImpl("TEAM_TITLE", "Team Title", "Team", true);
}

class ViewToggableEntityToggledEvent extends BasePubSubEvent
{
    constructor(private _toggledEntity: ViewToggableEntity, private _newState: boolean)
    {
        super(OrgChartEvents.VIEW_TOGGABLE_ENTITY_TOGGLED);
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
    private _viewState: Map<string, boolean> = new Map();

    constructor(propertyDescriptors: Set<OrgEntityPropertyDescriptor>)
    {
        // Add in all of the entity types
        this._viewState.set(OrgEntityTypes.MANAGER.name, true);
        this._viewState.set(OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR.name, true);
        this._viewState.set(OrgEntityTypes.TEAM.name, true);

        // Place holders for items that can be part of the label, but are fixed properties
        // FIXME - Should these be fixed?
        this._viewState.set(FixedOrgEntityPropertyDescriptors.TITLE.name, true);
        this._viewState.set(FixedOrgEntityPropertyDescriptors.TEAM_TITLE.name, false);

        // Add in properties that are not fixed
        for (const nextPropertyDescriptor of propertyDescriptors)
        {
            this._viewState.set(nextPropertyDescriptor.name, nextPropertyDescriptor.defaultVisibility)
        }
    }

    isVisible(entity: ViewToggableEntity): boolean
    {
        const valueToReturn = this._viewState.get(entity.name);
        if (valueToReturn === undefined)
        {
            throw new Error("Invalid parameter, " + entity);
        }
        return valueToReturn;
    }

    setVisible(entity: ViewToggableEntity, visible: boolean): void
    {
        this._viewState.set(entity.name, visible);
    }

    iterator(): IterableIterator<ViewToggableEntity>
    {
        throw new Error("Method not implemented.");
    }
}

enum OrgChartMode {
    READ_ONLY = "READ_ONLY",
    EDIT = "EDIT",
    PRINT = "PRINT"
}

export type{OrgChartEntityVisibleState, ViewToggableEntity};
export {
    OrgChartEntityVisibleStateImpl,
    OrgChartMode,
    ViewToggableEntityToggledEvent,
    FixedOrgEntityPropertyDescriptors
};
