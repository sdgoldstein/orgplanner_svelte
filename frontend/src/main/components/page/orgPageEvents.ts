import {BasePubSubEvent} from "orgplanner-common/jscore";
import type {OrgEntity, Employee} from "orgplanner-common/model";
import type {OrgEntityPropertyBag} from "../../../../../common/src/main/model/orgStructure/orgEntity";

class OrgPageEvents
{
    /**
     * Editing Toolbar Events
     */
    public static readonly ADD_EMPLOYEE_TOOLBAR_ACTION: string = "ADD_EMPLOYEE_TOOLBAR_ACTION";
    public static readonly DELETE_EMPLOYEE_TOOLBAR_ACTION: string = "DELETE_EMPLOYEE_TOOLBAR_ACTION";
    public static readonly CREATE_SNAPSHOT_TOOLBAR_ACTION: string = "CREATE_SNAPSHOT_TOOLBAR_ACTION";
    public static readonly MODIFY_SETTINGS_TOOLBAR_ACTION: string = "MODIFY_SETTINGS_TOOLBAR_ACTION";
    public static readonly SAVE_AS_IMAGE_TOOLBAR_ACTION: string = "SAVE_AS_IMAGE_TOOLBAR_ACTION";

    /**
     * CRUD Events
     */
    public static readonly ADD_EMPLOYEE: string = "ADD_EMPLOYEE";
    public static readonly EDIT_EMPLOYEE_ACTION: string = "EDIT_EMPLOYEE_ACTION";
    public static readonly EDIT_EMPLOYEE: string = "EDIT_EMPLOYEE";
    public static readonly DELETE_EMPLOYEE_ACTION: string = "DELETE_EMPLOYEE_ACTION";
    public static readonly DELETE_EMPLOYEE: string = "DELETE_EMPLOYEE";

    /**
     * App State Change Events
     */
    public static readonly SELECTION_CHANGED_EVENT: string = "SELECTION_CHANGED";

    /**
     * Other Events
     */
    public static readonly SAVE_AS_IMAGE: string = "SAVE_AS_IMAGE";
}

class OrgPageSelectionChangedEvent extends BasePubSubEvent
{
    constructor(public newSelectedEntities: OrgEntity[])
    {
        super(OrgPageEvents.SELECTION_CHANGED_EVENT);
    }
}

class NewEmployeeEvent extends BasePubSubEvent
{
    constructor(public name: string, public title: string, public managerId: string, public teamId: string,
                public isManager: boolean, public properties: OrgEntityPropertyBag)
    {
        super(OrgPageEvents.ADD_EMPLOYEE);
    }
}

class EditEmployeeActionEvent extends BasePubSubEvent
{
    constructor(public employeeToEdit: Employee)
    {
        super(OrgPageEvents.EDIT_EMPLOYEE_ACTION);
    }
}

class EditEmployeeEvent extends BasePubSubEvent
{
    constructor(public name: string, public title: string, public teamId: string,
                public properties: OrgEntityPropertyBag, public employeeToEdit: Employee)
    {
        super(OrgPageEvents.EDIT_EMPLOYEE);
    }
}

class DeleteEmployeeActionEvent extends BasePubSubEvent
{
    constructor(public employeeToDelete: Employee)
    {
        super(OrgPageEvents.DELETE_EMPLOYEE_ACTION);
    }
}

class DeleteEmployeeEvent extends BasePubSubEvent
{
    constructor(public employeeToDelete: Employee)
    {
        super(OrgPageEvents.DELETE_EMPLOYEE);
    }
}

class SaveAsImageEvent extends BasePubSubEvent
{
    constructor()
    {
        super(OrgPageEvents.SAVE_AS_IMAGE);
    }
}

export {
    OrgPageEvents,
    OrgPageSelectionChangedEvent,
    NewEmployeeEvent,
    EditEmployeeActionEvent,
    EditEmployeeEvent,
    DeleteEmployeeActionEvent,
    DeleteEmployeeEvent,
    SaveAsImageEvent
};