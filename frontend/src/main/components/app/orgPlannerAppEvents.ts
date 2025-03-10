import type {OrgPlannerSettings} from "@src/model/orgPlanner";
import {BasePubSubEvent} from "orgplanner-common/jscore";

class OrgPlannerAppEvents
{
    public static readonly CREATE_NEW_ORG: string = "CREATE_NEW_ORG";

    // FIXME - Can some of these be combined (e.g. OrgStructureChanged and PlanChanged)?
    // public static readonly SHOW_CHANGE_ORG_LEADER_MODAL: string = "SHOW_CHANGE_ORG_LEADER_MODAL";
    // public static readonly TOGGLE_STAT_CONTAINER: string = "TOGGLE_STAT_CONTAINER";
    // public static readonly CHANGE_ORG_LEADER: string = "CHANGE_ORG_LEADER";
    // public static readonly ORG_STRUCTURE_CHANGED: string = "ORG_STRUCTURE_CHANGED";
    // public static readonly TOGGLE_TEAM_MODE: string = "TOGGLE_TEAM_MODE";
    // public static readonly TOGGLE_PLANNING_MODE: string = "TOGGLE_PLANNING_MODE";
    // public static readonly PLAN_CHANGED: string = "PLAN_CHANGED";
    // public static readonly DELETE_SELECTED_EMPLOYEES_FROM_PLAN: string = "DELETE_SELECTED_EMPLOYEES_FROM_PLAN";
    // public static readonly DELETE_EMPLOYEE_FROM_PLAN: string = "DELETE_EMPLOYEE_FROM_PLAN";
    // public static readonly RESET_PLAN: string = "RESET_PLAN";
    public static readonly EXPORT_PLAN: string = "EXPORT_PLAN";
    public static readonly IMPORT_PLAN: string = "IMPORT_PLAN";
    // public static readonly SHOW_ADD_EMPLOYEE_MODAL: string = "SHOW_ADD_EMPLOYEE_MODAL";
    // public static readonly EMPLOYEE_EDITED: string = "EMPLOYEE_EDITED";
    // public static readonly SHOW_EDIT_EMPLOYEE_MODAL: string = "SHOW_EDIT_EMPLOYEE_MODAL";
    // public static readonly SHOW_NEW_ORG_MODAL: string = "SHOW_NEW_ORG_MODAL";
    public static readonly CHANGE_SETTINGS_ACTION: string = "CHANGE_SETTINGS_ACTION";
    public static readonly SETTINGS_CHANGED: string = "SETTINGS_CHANGED";
    // public static readonly SHOW_SETTINGS_MODAL: string = "SHOW_SETTINGS_MODAL";
    // public static readonly SHOW_CREATE_SNAPSHOT_MODAL: string = "SHOW_CREATE_SNAPSHOT_MODAL";
    // public static readonly CREATE_SNAPSHOT = "CREATE_SNAPSHOT";
    // public static readonly VIEW_TOGGABLE_ENTITY_TOGGLED = "VIEW_TOGGABLE_ENTITY_TOGGLED";
}

class CreateNewOrgEvent extends BasePubSubEvent
{
    private readonly _orgName: string;

    constructor(orgName: string)
    {
        super(OrgPlannerAppEvents.CREATE_NEW_ORG);
        this._orgName = orgName;
    }

    public get orgName(): string
    {
        return this._orgName;
    }
}

class ChangeSettingsActionEvent extends BasePubSubEvent
{
    constructor(public newSettings: OrgPlannerSettings)
    {
        super(OrgPlannerAppEvents.CHANGE_SETTINGS_ACTION);
    }
}

class SettingsChangedEvent extends BasePubSubEvent
{
    constructor()
    {
        super(OrgPlannerAppEvents.SETTINGS_CHANGED);
    }
}

class ExportPlanEvent extends BasePubSubEvent
{
    constructor()
    {
        super(OrgPlannerAppEvents.EXPORT_PLAN);
    }
}

class ImportPlanEvent extends BasePubSubEvent
{
    private readonly _jsonToImport: string;

    constructor(jsonToImport: string)
    {
        super(OrgPlannerAppEvents.IMPORT_PLAN);
        this._jsonToImport = jsonToImport;
    }

    get jsonToImport(): string
    {
        return this._jsonToImport;
    }
}

export {
    OrgPlannerAppEvents,
    CreateNewOrgEvent,
    ChangeSettingsActionEvent,
    SettingsChangedEvent,
    ExportPlanEvent,
    ImportPlanEvent,
};
