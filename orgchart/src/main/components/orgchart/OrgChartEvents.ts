import {BasePubSubEvent} from "orgplanner-common/jscore";
import type {OrgEntity, Employee} from "orgplanner-common/model";

class OrgChartEvents
{
    /**
     * CRUD Events
     */
    public static readonly EDIT_ENTITY_CELL_ACTION: string = "EDIT_ENTITY_CELL_ACTION";
    public static readonly DELETE_ENTITY_CELL_ACTION: string = "DELETE_ENTITY_CELL_ACTION";

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
    public static readonly DROP_MOUSE_EVENT: string = "DROP_MOUSE_EVENT";

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

class EditEntityCellActionEvent extends BasePubSubEvent
{
    constructor(public employeeToEdit: Employee)
    {
        super(OrgChartEvents.EDIT_ENTITY_CELL_ACTION);
    }
}

class DeleteEntityCellActionEvent extends BasePubSubEvent
{
    constructor(public employeeToDelete: Employee)
    {
        super(OrgChartEvents.DELETE_ENTITY_CELL_ACTION);
    }
}

class DropMouseEvent extends BasePubSubEvent
{
    constructor(public sourceEntityt: OrgEntity, public targetEntity: OrgEntity)
    {
        super(OrgChartEvents.DROP_MOUSE_EVENT);
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
    EditEntityCellActionEvent,
    DeleteEntityCellActionEvent,
    DropMouseEvent
};