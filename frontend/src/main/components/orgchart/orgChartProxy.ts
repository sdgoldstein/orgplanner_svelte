
import {BasePubSubEvent, type PubSubEvent, type PubSubListener, PubSubManager} from "orgplanner-common/jscore";
import {
    type Employee,
    type OrgEntityColorTheme,
    OrgEntityColorThemes,
    type OrgEntityPropertyDescriptor,
    type OrgStructure
} from "orgplanner-common/model";

import {OrgChartMaxGraph} from "./graph/orgChartMaxGraph";
import {OrgChartMaxGraphThemeBase} from "./graph/themes/orgChartMaxGraphThemeBase";
import {
    OrgChartEntityVisibleStateImpl,
    OrgChartMode,
    ViewToggableEntityToggledEvent,
} from "./orgChartViewState";
import {
    OrgStructureChangedEventEntitiesRemoved,
    OrgStructureChangedEventEntityAdded,
    OrgStructureChangedEventEntityEdited,
    OrgStructureChangedEvents
} from "../page/orgStructureEvents";
import {OrgPlannerAppEvents} from "../app/orgPlannerAppEvents";
import {OrgPageEvents} from "../page/orgPageEvents";

interface OrgChartProps
{
    orgStructure: OrgStructure;
    mode: OrgChartMode;
    colorTheme: OrgEntityColorTheme;
    propertyDescriptors: Set<OrgEntityPropertyDescriptor>;
}

class ShowAddEmployeeModalEvent extends BasePubSubEvent
{
    constructor(public managerId: string)
    {
        super(OrgPlannerAppEvents.SHOW_ADD_EMPLOYEE_MODAL);
    }
}

class DeleteEmployeeFromPlanEvent extends BasePubSubEvent
{
    constructor()
    {
        super(OrgPlannerAppEvents.DELETE_SELECTED_EMPLOYEES_FROM_PLAN);
    }
}

/**
 * This is a class used by all clients/external logic of the orgchart to make orgchat changes, whether by event or
 * direect invocation.  All execution flow leads into the graph.
 *
 * If the graph needs to communicate in the other direction, it will use events
 */
class OrgChartProxy implements PubSubListener
{
    private _colorTheme: OrgEntityColorTheme = OrgEntityColorThemes.DEEP_BLUE_THEME;
    private _orgStructure?: OrgStructure;
    private _mode: OrgChartMode = OrgChartMode.READ_ONLY;
    private _currentGraph?: OrgChartMaxGraph;
    private _propertyDescriptors: Set<OrgEntityPropertyDescriptor> = new Set();

    constructor(private _chartContainer: HTMLElement) {};

    onMount(): void
    {
        const pubSubManager = PubSubManager.instance;
        pubSubManager.registerListener(OrgPlannerAppEvents.ORG_STRUCTURE_CHANGED, this);
        pubSubManager.registerListener(OrgPlannerAppEvents.TOGGLE_TEAM_MODE, this);
        pubSubManager.registerListener(OrgPlannerAppEvents.TOGGLE_PLANNING_MODE, this);
        pubSubManager.registerListener(OrgPlannerAppEvents.VIEW_TOGGABLE_ENTITY_TOGGLED, this);
        pubSubManager.registerListener(OrgStructureChangedEvents.ORG_ENTITY_ADDED, this);
        pubSubManager.registerListener(OrgStructureChangedEvents.ORG_ENTITY_EDITED, this);
        pubSubManager.registerListener(OrgStructureChangedEvents.ORG_ENTITIES_REMOVED, this);
        pubSubManager.registerListener(OrgPageEvents.SAVE_AS_IMAGE, this);
    }

    onDismount(): void
    {
        const pubSubManager = PubSubManager.instance;
        pubSubManager.unregisterListener(OrgPlannerAppEvents.ORG_STRUCTURE_CHANGED, this);
        pubSubManager.unregisterListener(OrgPlannerAppEvents.TOGGLE_TEAM_MODE, this);
        pubSubManager.unregisterListener(OrgPlannerAppEvents.TOGGLE_PLANNING_MODE, this);
        pubSubManager.unregisterListener(OrgPlannerAppEvents.VIEW_TOGGABLE_ENTITY_TOGGLED, this);
        pubSubManager.unregisterListener(OrgStructureChangedEvents.ORG_ENTITY_ADDED, this);
        pubSubManager.unregisterListener(OrgStructureChangedEvents.ORG_ENTITY_EDITED, this);
        pubSubManager.unregisterListener(OrgStructureChangedEvents.ORG_ENTITIES_REMOVED, this);
        pubSubManager.registerListener(OrgPageEvents.SAVE_AS_IMAGE, this);

        this._currentGraph?.destroy();
    }

    private get currentGraph(): OrgChartMaxGraph
    {
        if (!this._currentGraph)
        {
            throw new Error("Retrieved current graph before it was created");
        }

        return this._currentGraph;
    }

    updated(orgChartProps: OrgChartProps): void
    {
        if (!this._currentGraph)
        {
            this._propertyDescriptors = orgChartProps.propertyDescriptors;
            this._orgStructure = orgChartProps.orgStructure;
            this._colorTheme = orgChartProps.colorTheme;
            this._mode = orgChartProps.mode;

            const orgChartTheme = new OrgChartMaxGraphThemeBase(this._colorTheme);
            const visibiltyState = new OrgChartEntityVisibleStateImpl(this._propertyDescriptors);
            this._currentGraph =
                new OrgChartMaxGraph(this._chartContainer, this._orgStructure, orgChartTheme, visibiltyState);

            this._currentGraph.renderGraph();
        }
        else
        {
            const savedCurrentGraph = this._currentGraph;
            this._currentGraph.batchUpdate(() => {
                if (orgChartProps.orgStructure != this._orgStructure)
                {
                    this._orgStructure = orgChartProps.orgStructure;
                    savedCurrentGraph.orgStructure = this._orgStructure;
                }
                if (orgChartProps.propertyDescriptors != this._propertyDescriptors)
                {
                    this._propertyDescriptors = orgChartProps.propertyDescriptors;
                    savedCurrentGraph.visibilityState = new OrgChartEntityVisibleStateImpl(this._propertyDescriptors);
                }
                if (orgChartProps.colorTheme != this._colorTheme)
                {
                    this._colorTheme = orgChartProps.colorTheme;
                    savedCurrentGraph.graphTheme = new OrgChartMaxGraphThemeBase(this._colorTheme);
                }
            })
        }
    }

    onEvent(eventName: string, event: PubSubEvent): void
    {
        if (eventName === OrgPlannerAppEvents.VIEW_TOGGABLE_ENTITY_TOGGLED)
        {
            const viewToggableEvent = event as ViewToggableEntityToggledEvent;
            const entity = viewToggableEvent.getViewToggableEntity();
            const newState = viewToggableEvent.getNewState();
            this.currentGraph.onVisibilityUpdate(entity, newState);
        }
        else if (eventName === OrgStructureChangedEvents.ORG_ENTITY_ADDED)
        {
            const orgEntityAddedEvent = event as OrgStructureChangedEventEntityAdded;
            this.currentGraph.addEmployee(orgEntityAddedEvent.entityAded as Employee);
        }
        else if (eventName === OrgStructureChangedEvents.ORG_ENTITY_EDITED)
        {
            const orgEntityEditedEvent = event as OrgStructureChangedEventEntityEdited;
            this.currentGraph.employeeEdited(orgEntityEditedEvent.entityEdited as Employee);
        }
        else if (eventName === OrgStructureChangedEvents.ORG_ENTITIES_REMOVED)
        {
            const orgEntityDeletedEvent = event as OrgStructureChangedEventEntitiesRemoved;
            this.currentGraph.employeesDeleted(orgEntityDeletedEvent.entitiesRemoved as Employee[]);
        }
        else if (eventName === OrgPageEvents.SAVE_AS_IMAGE)
        {
            this.currentGraph.saveAsImage();
        }
    }
}

export type{OrgChartProps};
export {OrgChartProxy, ShowAddEmployeeModalEvent, DeleteEmployeeFromPlanEvent};
