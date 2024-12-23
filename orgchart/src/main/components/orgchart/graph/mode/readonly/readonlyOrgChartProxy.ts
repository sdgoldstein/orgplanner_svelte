import {OrgChartEntityVisibleStateImpl} from "@src/components/orgchart/orgChartViewState";
import {PubSubManager} from "orgplanner-common/jscore";

import type {OrgChartProxy} from "../../model/orgChartProxy";
import {OrgChartProxyBase} from "../shared/orgChartProxyBase";
import type {OrgChartProps} from "../editable/editableOrgChartProxy";
import {ReadOnlyOrgChartMaxGraph} from "./readOnlyOrgChartMaxGraph";
import {ReadOnlyOrgChartMaxGraphTheme} from "./readOnlyOrgChartMaxGraphTheme";
import {OrgChartEvents} from "../../../OrgChartEvents";
import {
    ViewToggableEntityToggledEventHandler,
    type EntityViewToggableOrgChartProxy
} from "../shared/viewToggableEntityEventHandler";

class ReadOnlyOrgChartProxy extends OrgChartProxyBase implements OrgChartProxy, EntityViewToggableOrgChartProxy
{
    private _viewToggableEntityToggledEventHandler: ViewToggableEntityToggledEventHandler;

    private _currentGraph?: ReadOnlyOrgChartMaxGraph;

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
    }

    onDismount(): void
    {
        super.onDismount();

        const pubSubManager = PubSubManager.instance;
        pubSubManager.unregisterListener(OrgChartEvents.VIEW_TOGGABLE_ENTITY_TOGGLED,
                                         this._viewToggableEntityToggledEventHandler);

        this._currentGraph?.destroy();
    }

    onUpdate(orgChartProps: OrgChartProps): void
    {
        if (this.chartContainer === undefined)
        {
            throw new Error("No chart container set");
        }

        if (!this._currentGraph)
        {
            const orgChartTheme = new ReadOnlyOrgChartMaxGraphTheme(orgChartProps.colorTheme);
            const visibiltyState = new OrgChartEntityVisibleStateImpl(orgChartProps.propertyDescriptors);
            this._currentGraph = new ReadOnlyOrgChartMaxGraph(this.chartContainer, orgChartProps.orgStructure,
                                                              orgChartTheme, visibiltyState);
        }
        this._currentGraph.renderGraph();
    };

    get proxiedGraph(): ReadOnlyOrgChartMaxGraph
    {
        if (!this._currentGraph)
        {
            throw new Error("Retrieved current graph before it was created");
        }

        return this._currentGraph;
    }
}

export {ReadOnlyOrgChartProxy};
