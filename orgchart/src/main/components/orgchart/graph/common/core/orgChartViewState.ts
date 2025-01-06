import {
    type OrgEntityPropertyDescriptor,
    OrgEntityPropertyDescriptorImpl,
    OrgEntityTypes
} from "orgplanner-common/model";
import type {ViewToggableEntity} from "../../../orgChart";

// FIXME - Probably need to create another type besides OrgEntityPropertyDescriptor and add it to ViewToggaleEntity list
class FixedOrgEntityPropertyDescriptors
{
    static readonly TITLE: OrgEntityPropertyDescriptor =
        new OrgEntityPropertyDescriptorImpl("TITLE", "Title", "Employee", true);
    static readonly TEAM_TITLE: OrgEntityPropertyDescriptor =
        new OrgEntityPropertyDescriptorImpl("TEAM_TITLE", "Team Title", "Team", true);
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

export type{OrgChartEntityVisibleState, ViewToggableEntity};
export {OrgChartEntityVisibleStateImpl, FixedOrgEntityPropertyDescriptors};
