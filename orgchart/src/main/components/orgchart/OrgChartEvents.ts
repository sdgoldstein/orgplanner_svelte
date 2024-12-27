import {BasePubSubEvent} from "orgplanner-common/jscore";
import type {Employee, OrgEntity, Team} from "orgplanner-common/model";

class OrgChartEvents
{
    /**
     * CRUD Events
     */
    public static readonly EDIT_EMPLOYEE_CELL_ACTION: string = "EDIT_EMPLOYEE_CELL_ACTION";
    public static readonly DELETE_EMPLOYEE_CELL_ACTION: string = "DELETE_EMPLOYEE_CELL_ACTION";
    public static readonly EDIT_TEAM_CELL_ACTION: string = "EDIT_TEAM_CELL_ACTION";
    public static readonly DELETE_TEAM_CELL_ACTION: string = "DELETE_TEAM_CELL_ACTION";

    /**
     * State Change Events
     */
    public static readonly ORG_CHART_SELECTION_CHANGED_EVENT: string = "ORG_CHART_SELECTION_CHANGED";

    /**
     * Control Events
     */
    public static readonly VIEW_TOGGABLE_ENTITY_TOGGLED = "VIEW_TOGGABLE_ENTITY_TOGGLED";

    /**
     * Drag&Drop Events
     */
    public static readonly DROP_ENTITY_ON_ENTITY_MOUSE_EVENT: string = "DROP_ENTITY_ON_ENTITY_MOUSE_EVENT";

    // public static readonly SAVE_AS_IMAGE: string = "SAVE_AS_IMAGE";
    /**
     *
     */
}

class OrgChartSelectionChangedEvent extends BasePubSubEvent
{
    constructor(public newSelectedEntities: OrgEntity[])
    {
        super(OrgChartEvents.ORG_CHART_SELECTION_CHANGED_EVENT);
    }
}

class EditEmployeeCellActionEvent extends BasePubSubEvent
{
    constructor(public employeeToEdit: Employee)
    {
        super(OrgChartEvents.EDIT_EMPLOYEE_CELL_ACTION);
    }
}

class DeleteEmployeeCellActionEvent extends BasePubSubEvent
{
    constructor(public employeeToDelete: Employee)
    {
        super(OrgChartEvents.DELETE_EMPLOYEE_CELL_ACTION);
    }
}

class EditTeamCellActionEvent extends BasePubSubEvent
{
    constructor(public teamToEdit: Team)
    {
        super(OrgChartEvents.EDIT_TEAM_CELL_ACTION);
    }
}

class DeleteTeamCellActionEvent extends BasePubSubEvent
{
    constructor(public teamToDelete: Team)
    {
        super(OrgChartEvents.DELETE_TEAM_CELL_ACTION);
    }
}

class DropEntityOnEntityMouseEvent extends BasePubSubEvent
{
    constructor(public sourceEntityt: OrgEntity, public targetEntity: OrgEntity)
    {
        super(OrgChartEvents.DROP_ENTITY_ON_ENTITY_MOUSE_EVENT);
    }
}

/*
class SaveAsImageEvent extends BasePubSubEvent
{
    constructor()
    {
        super(OrgChartEvents.SAVE_AS_IMAGE);
    }
}*/

export {
    OrgChartEvents,
    OrgChartSelectionChangedEvent,
    EditEmployeeCellActionEvent,
    DeleteEmployeeCellActionEvent,
    EditTeamCellActionEvent,
    DeleteTeamCellActionEvent,
    DropEntityOnEntityMouseEvent
};