
import {type PubSubEvent, type PubSubListener, PubSubManager} from "orgplanner-common/jscore";
import {
    type Employee,
    type OrgEntityColorTheme,
    OrgEntityColorThemes,
    type OrgEntityPropertyDescriptor,
    OrgEntityTypes,
    type OrgStructure,
    OrgStructureChangedEventEntitiesRemoved,
    OrgStructureChangedEventEntitiesAdded,
    OrgStructureChangedEventEntityEdited,
    OrgStructureChangedEvents,
    type Team,
    OrgStructureChangedEventEntitiesMoved
} from "orgplanner-common/model";

import {EditableOrgChartMaxGraph} from "./editbleOrgChartMaxGraph";
import {
    OrgChartEntityVisibleStateImpl,
} from "../../common/core/orgChartViewState";
import type {OrgChartProxy} from "../base/orgChartProxy";
import {OrgChartEvents, OrgChartSelectionChangedEvent} from "../../../OrgChartEvents";
import {OrgChartProxyBase} from "../shared/orgChartProxyBase";
import {
    ViewToggableEntityToggledEventHandler,
    type EntityViewToggableOrgChartMaxGraph,
    type EntityViewToggableOrgChartProxy
} from "../shared/viewToggableEntityEventHandler";
import {EditableOrgChartMaxGraphTheme} from "./editableOrgChartMaxGraphTheme";
import {InternalEvent} from "@maxgraph/core";
import type {OrgChartProps} from "@src/components/orgchart/orgChart";

/**
 * This is a class used by all clients/external logic of the orgchart to make orgchat changes, whether by event or
 * direect invocation.  All execution flow leads into the graph.
 *
 * If the graph needs to communicate in the other direction, it will use events
 */
class EditableOrgChartProxy extends OrgChartProxyBase implements OrgChartProxy, PubSubListener,
                                                                 EntityViewToggableOrgChartProxy
{
    // FIXME?
    get proxiedGraph(): EntityViewToggableOrgChartMaxGraph
    {
        if (!this._currentGraph)
        {
            throw new Error("Retrieved current graph before it was created");
        }

        return this._currentGraph;
    }

    private _colorTheme: OrgEntityColorTheme = OrgEntityColorThemes.DEEP_BLUE_THEME;
    private _orgStructure?: OrgStructure;
    private _currentGraph?: EditableOrgChartMaxGraph;
    private _propertyDescriptors: Set<OrgEntityPropertyDescriptor> = new Set();

    private _viewToggableEntityToggledEventHandler: ViewToggableEntityToggledEventHandler;

    constructor()
    {
        super();
        this._viewToggableEntityToggledEventHandler = new ViewToggableEntityToggledEventHandler(this);
    }

    onMount(chartContainer: HTMLElement): void
    {
        super.onMount(chartContainer);

        const pubSubManager = PubSubManager.instance;
        pubSubManager.registerListener(OrgChartEvents.VIEW_TOGGABLE_ENTITY_TOGGLED,
                                       this._viewToggableEntityToggledEventHandler);
        pubSubManager.registerListener(OrgStructureChangedEvents.ORG_ENTITIES_ADDED, this);
        pubSubManager.registerListener(OrgStructureChangedEvents.ORG_ENTITY_EDITED, this);
        pubSubManager.registerListener(OrgStructureChangedEvents.ORG_ENTITIES_REMOVED, this);
        pubSubManager.registerListener(OrgStructureChangedEvents.ORG_ENTITIES_MOVED, this);
    }

    onDismount(): void
    {
        super.onDismount();

        const pubSubManager = PubSubManager.instance;
        pubSubManager.unregisterListener(OrgChartEvents.VIEW_TOGGABLE_ENTITY_TOGGLED,
                                         this._viewToggableEntityToggledEventHandler);
        pubSubManager.unregisterListener(OrgStructureChangedEvents.ORG_ENTITIES_ADDED, this);
        pubSubManager.unregisterListener(OrgStructureChangedEvents.ORG_ENTITY_EDITED, this);
        pubSubManager.unregisterListener(OrgStructureChangedEvents.ORG_ENTITIES_REMOVED, this);
        pubSubManager.unregisterListener(OrgStructureChangedEvents.ORG_ENTITIES_MOVED, this);

        // FIXME - this._currentGraph?.removeListener(this)
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
                        savedCurrentGraph.graphTheme = new EditableOrgChartMaxGraphTheme(this._colorTheme);
                    }
                })
            }
        }
    }

    private _createGraphAndRender(orgChartProps: OrgChartProps)
    {
        // Clear our container
        this.chartContainer.innerHTML = "";

        this._propertyDescriptors = orgChartProps.propertyDescriptors;
        this._orgStructure = orgChartProps.orgStructure;
        this._colorTheme = orgChartProps.colorTheme;

        if (this._orgStructure === undefined)
        {
            throw new Error("OrgStructure must be provided");
        }

        const orgChartTheme = new EditableOrgChartMaxGraphTheme(this._colorTheme);
        const visibiltyState = new OrgChartEntityVisibleStateImpl(this._propertyDescriptors);
        this._currentGraph =
            new EditableOrgChartMaxGraph(this.chartContainer, this._orgStructure, orgChartTheme, visibiltyState);

        this._currentGraph.renderGraph();

        // FIXME - Is there a better place for this?
        this._currentGraph.selectionModel.addListener(InternalEvent.CHANGE, () => {
            const selectedEntities = this._currentGraph!.getSelectedEntities();
            const selectionChangedEvent = new OrgChartSelectionChangedEvent(selectedEntities);
            PubSubManager.instance.fireEvent(selectionChangedEvent);
        });
    }

    onEvent(eventName: string, event: PubSubEvent): void
    {
        if (eventName === OrgStructureChangedEvents.ORG_ENTITIES_ADDED)
        {
            const orgEntityAddedEvent = event as unknown as OrgStructureChangedEventEntitiesAdded;
            for (const nextEntityAdded of orgEntityAddedEvent.entitiesAded)
            {
                if (nextEntityAdded.orgEntityType === OrgEntityTypes.TEAM)
                {
                    this.currentGraph.addTeam(nextEntityAdded as Team);
                }
                else
                {
                    this.currentGraph.addEmployee(nextEntityAdded as Employee);
                }
            }
        }
        else if (eventName === OrgStructureChangedEvents.ORG_ENTITY_EDITED)
        {
            const orgEntityEditedEvent = event as unknown as OrgStructureChangedEventEntityEdited;
            this.currentGraph.entityEdited(orgEntityEditedEvent.entityEdited);
        }
        else if (eventName === OrgStructureChangedEvents.ORG_ENTITIES_REMOVED)
        {
            const orgEntityDeletedEvent = event as unknown as OrgStructureChangedEventEntitiesRemoved;

            this.currentGraph.entitiesDeleted(orgEntityDeletedEvent.entitiesRemoved);
        }
        else if (eventName === OrgStructureChangedEvents.ORG_ENTITIES_MOVED)
        {
            const orgEntitiesMovedEvent = event as unknown as OrgStructureChangedEventEntitiesMoved;
            this.currentGraph.entitiesMoved(orgEntitiesMovedEvent.movedEntity, orgEntitiesMovedEvent.newParent,
                                            orgEntitiesMovedEvent.previousParent);
        }
    }
}

export type{OrgChartProps};
export {EditableOrgChartProxy};
