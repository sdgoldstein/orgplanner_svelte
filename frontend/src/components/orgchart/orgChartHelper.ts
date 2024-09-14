
import {BasePubSubEvent, type PubSubEvent, type PubSubListener, PubSubManager} from "orgplanner-common/jscore";
import {
    type Employee,
    type OrgEntity,
    type OrgEntityColorTheme,
    OrgEntityColorThemes,
    type OrgEntityPropertyDescriptor,
    OrgEntityTypes,
    type OrgStructure
} from "orgplanner-common/model";

import {OrgPlannerAppEvents} from "../app/orgPlannerAppEvents";

import {OrgChartMaxGraph} from "./graph/orgChartMaxGraph";
import {OrgChartMaxGraphThemeBase} from "./graph/themes/orgChartMaxGraphThemeBase";
import {
    OrgChartEntityVisibleStateImpl,
    OrgChartMode,
    ViewToggableEntityToggledEvent,
} from "./orgChartViewState";

interface OrgChartProps
{
    orgStructure: OrgStructure;
    mode: OrgChartMode;
    colorTheme: OrgEntityColorTheme;
    propertyDescriptors: Set<OrgEntityPropertyDescriptor>;
}

class NewEmployeeEvent extends BasePubSubEvent
{
    constructor(public newEmployee: Employee)
    {
        super(OrgPlannerAppEvents.ADD_EMPLOYEE);
    }
}

class ShowAddEmployeeModalEvent extends BasePubSubEvent
{
    constructor(public managerId: string)
    {
        super(OrgPlannerAppEvents.SHOW_ADD_EMPLOYEE_MODAL);
    }
}

class OrgChartHelper implements PubSubListener
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
        pubSubManager.registerListener(OrgPlannerAppEvents.ADD_EMPLOYEE_TOOLBAR_ACTION, this);
        pubSubManager.registerListener(OrgPlannerAppEvents.ADD_EMPLOYEE, this);
    }

    onDismount(): void
    {
        const pubSubManager = PubSubManager.instance;
        pubSubManager.unregisterListener(OrgPlannerAppEvents.ORG_STRUCTURE_CHANGED, this);
        pubSubManager.unregisterListener(OrgPlannerAppEvents.TOGGLE_TEAM_MODE, this);
        pubSubManager.unregisterListener(OrgPlannerAppEvents.TOGGLE_PLANNING_MODE, this);
        pubSubManager.unregisterListener(OrgPlannerAppEvents.VIEW_TOGGABLE_ENTITY_TOGGLED, this);
        pubSubManager.unregisterListener(OrgPlannerAppEvents.ADD_EMPLOYEE_TOOLBAR_ACTION, this);
        pubSubManager.unregisterListener(OrgPlannerAppEvents.ADD_EMPLOYEE, this);

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
        else if (eventName === OrgPlannerAppEvents.ADD_EMPLOYEE_TOOLBAR_ACTION)
        {
            if (!this._orgStructure)
            {
                throw new Error("Org Structure is not defined");
            }

            if (!this._currentGraph)
            {
                throw new Error("Current graph is not defined");
            }

            let managerId: string = this._orgStructure?.orgLeader.id;
            if (this._currentGraph.isEntitySelected())
            {
                const selectedEntity: OrgEntity = this._currentGraph.getSelectedEntity();
                if (selectedEntity.orgEntityType == OrgEntityTypes.MANAGER)
                {
                    managerId = selectedEntity.id;
                }
            }
            const eventToFire = new ShowAddEmployeeModalEvent(managerId);
            PubSubManager.instance.fireEvent(eventToFire);
        }
        else if (eventName === OrgPlannerAppEvents.ADD_EMPLOYEE)
        {
            this.currentGraph.addEmployee((event as NewEmployeeEvent).newEmployee);
        }
    }
}

export type{OrgChartProps};
export {OrgChartHelper, ShowAddEmployeeModalEvent, NewEmployeeEvent};
