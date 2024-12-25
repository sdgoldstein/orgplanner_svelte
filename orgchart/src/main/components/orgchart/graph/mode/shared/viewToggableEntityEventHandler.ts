import {OrgChartEvents} from "@src/components/orgchart/OrgChartEvents";
import type {ViewToggableEntity, ViewToggableEntityToggledEvent} from "@src/components/orgchart/orgChartViewState";
import type {PubSubEvent, PubSubListener} from "orgplanner-common/jscore";
import type {OrgChartMaxGraph} from "../../common/core/orgChartMaxGraph";

interface EntityViewToggableOrgChartMaxGraph extends OrgChartMaxGraph
{
    onVisibilityUpdate(entity: ViewToggableEntity, isVisible: boolean): void;
}

interface EntityViewToggableOrgChartProxy
{
    proxiedGraph: EntityViewToggableOrgChartMaxGraph;
}

class ViewToggableEntityToggledEventHandler implements PubSubListener
{
    constructor(private _orgChartProxy: EntityViewToggableOrgChartProxy) {}
    onEvent(eventName: string, eventToHandle: PubSubEvent): void
    {
        if (eventName === OrgChartEvents.VIEW_TOGGABLE_ENTITY_TOGGLED)
        {
            const viewToggableEvent = eventToHandle as ViewToggableEntityToggledEvent;
            const entity = viewToggableEvent.getViewToggableEntity();
            const newState = viewToggableEvent.getNewState();
            this._orgChartProxy.proxiedGraph.onVisibilityUpdate(entity, newState);
        }
    }
}

export {ViewToggableEntityToggledEventHandler};
export type{EntityViewToggableOrgChartProxy, EntityViewToggableOrgChartMaxGraph};
