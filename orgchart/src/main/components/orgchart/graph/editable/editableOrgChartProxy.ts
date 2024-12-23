
import {type PubSubEvent, type PubSubListener, PubSubManager} from "orgplanner-common/jscore";
import {
    type Employee,
    type OrgEntityColorTheme,
    OrgEntityColorThemes,
    type OrgEntityPropertyDescriptor,
    type OrgStructure,
    OrgStructureChangedEventEntitiesRemoved,
    OrgStructureChangedEventEntityAdded,
    OrgStructureChangedEventEntityEdited,
    OrgStructureChangedEvents
} from "orgplanner-common/model";

import {EditableOrgChartMaxGraph} from "./editbleOrgChartMaxGraph";
import {OrgChartMaxGraphThemeDefault} from "../common/themes/orgChartMaxGraphThemeDefault";
import {
    OrgChartEntityVisibleStateImpl,
    ViewToggableEntityToggledEvent,
} from "../../orgChartViewState";
import type {OrgChartProps, OrgChartProxy} from "../model/orgChartProxy";
import {OrgChartEvents} from "../../OrgChartEvents";

/**
 * This is a class used by all clients/external logic of the orgchart to make orgchat changes, whether by event or
 * direect invocation.  All execution flow leads into the graph.
 *
 * If the graph needs to communicate in the other direction, it will use events
 */
class EditableOrgChartProxy implements OrgChartProxy, PubSubListener
{
    private _colorTheme: OrgEntityColorTheme = OrgEntityColorThemes.DEEP_BLUE_THEME;
    private _orgStructure?: OrgStructure;
    private _currentGraph?: EditableOrgChartMaxGraph;
    private _propertyDescriptors: Set<OrgEntityPropertyDescriptor> = new Set();

    constructor(private _chartContainer: HTMLElement) {};

    onMount(): void
    {
        const pubSubManager = PubSubManager.instance;
        pubSubManager.registerListener(OrgChartEvents.VIEW_TOGGABLE_ENTITY_TOGGLED, this);
        pubSubManager.registerListener(OrgStructureChangedEvents.ORG_ENTITY_ADDED, this);
        pubSubManager.registerListener(OrgStructureChangedEvents.ORG_ENTITY_EDITED, this);
        pubSubManager.registerListener(OrgStructureChangedEvents.ORG_ENTITIES_REMOVED, this);
    }

    onDismount(): void
    {
        const pubSubManager = PubSubManager.instance;
        pubSubManager.unregisterListener(OrgChartEvents.VIEW_TOGGABLE_ENTITY_TOGGLED, this);
        pubSubManager.unregisterListener(OrgStructureChangedEvents.ORG_ENTITY_ADDED, this);
        pubSubManager.unregisterListener(OrgStructureChangedEvents.ORG_ENTITY_EDITED, this);
        pubSubManager.unregisterListener(OrgStructureChangedEvents.ORG_ENTITIES_REMOVED, this);

        this._currentGraph?.destroy();
    }

    private get currentGraph(): EditableOrgChartMaxGraph
    {
        if (!this._currentGraph)
        {
            throw new Error("Retrieved current graph before it was created");
        }

        return this._currentGraph;
    }

    onUpdate(orgChartProps: OrgChartProps): void
    {
        if (!this._currentGraph)
        {
            this._createGraphAndRender(orgChartProps);
        }
        else
        {
            if (orgChartProps.orgStructure != this._orgStructure)
            {
                this._createGraphAndRender(orgChartProps);
            }
            else
            {
                const savedCurrentGraph = this._currentGraph;
                this._currentGraph.batchUpdate(() => {
                    /* if (orgChartProps.orgStructure != this._orgStructure)
                     {
                         this._orgStructure = orgChartProps.orgStructure;
                         savedCurrentGraph.orgStructure = this._orgStructure;
                     }
                     if (orgChartProps.propertyDescriptors != this._propertyDescriptors)
                     {
                         this._propertyDescriptors = orgChartProps.propertyDescriptors;
                         savedCurrentGraph.visibilityState =
                             new OrgChartEntityVisibleStateImpl(this._propertyDescriptors);
                     }*/
                    if (orgChartProps.colorTheme != this._colorTheme)
                    {
                        this._colorTheme = orgChartProps.colorTheme;
                        savedCurrentGraph.graphTheme = new OrgChartMaxGraphThemeDefault(this._colorTheme);
                    }
                })
            }
        }
    }

    private _createGraphAndRender(orgChartProps: OrgChartProps)
    {
        // Clear our container
        this._chartContainer.innerHTML = "";

        this._propertyDescriptors = orgChartProps.propertyDescriptors;
        this._orgStructure = orgChartProps.orgStructure;
        this._colorTheme = orgChartProps.colorTheme;

        const orgChartTheme = new OrgChartMaxGraphThemeDefault(this._colorTheme);
        const visibiltyState = new OrgChartEntityVisibleStateImpl(this._propertyDescriptors);
        this._currentGraph =
            new EditableOrgChartMaxGraph(this._chartContainer, this._orgStructure, orgChartTheme, visibiltyState);

        this._currentGraph.renderGraph();
    }

    onEvent(eventName: string, event: PubSubEvent): void
    {
        if (eventName === OrgChartEvents.VIEW_TOGGABLE_ENTITY_TOGGLED)
        {
            const viewToggableEvent = event as ViewToggableEntityToggledEvent;
            const entity = viewToggableEvent.getViewToggableEntity();
            const newState = viewToggableEvent.getNewState();
            this.currentGraph.onVisibilityUpdate(entity, newState);
        }
        else if (eventName === OrgStructureChangedEvents.ORG_ENTITY_ADDED)
        {
            const orgEntityAddedEvent = event as unknown as OrgStructureChangedEventEntityAdded;
            this.currentGraph.addEmployee(orgEntityAddedEvent.entityAded as Employee);
        }
        else if (eventName === OrgStructureChangedEvents.ORG_ENTITY_EDITED)
        {
            const orgEntityEditedEvent = event as unknown as OrgStructureChangedEventEntityEdited;
            this.currentGraph.employeeEdited(orgEntityEditedEvent.entityEdited as Employee);
        }
        else if (eventName === OrgStructureChangedEvents.ORG_ENTITIES_REMOVED)
        {
            const orgEntityDeletedEvent = event as unknown as OrgStructureChangedEventEntitiesRemoved;
            this.currentGraph.employeesDeleted(orgEntityDeletedEvent.entitiesRemoved as Employee[]);
        }
    }
}

export type{OrgChartProps};
export {EditableOrgChartProxy};
