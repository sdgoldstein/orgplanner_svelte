import {BasePubSubEvent} from "orgplanner-common/jscore";
import type {OrgEntityPropertyBag, OrgEntity, Employee, Team} from "orgplanner-common/model";

/*
New Employee Example
1.  OrgChartEditingToolbar fires
OrgChartEditingToolbar.AddEmployeeToolbarEvent(OrgChartEditingToolbarEvents.ADD_EMPLOYEE_TOOLBAR_ACTION)->OrgPage.svelte
Launches NewEditEmployeeModal
2.  NewEditEmployeeModal fires orgPageEvents.NewEmployeeEvent(orgPageEvents.ADD_EMPLOYEE)->DefaultOrgPageMediator
modifies OrgStructure
3.  DefaultOrgPageMediator fires
OrgStructureChangedEvents.OrgStructureChangedEventEntityAdded(OrgStructureChangedEvents.ORG_ENTITY_ADDED) ->
EditableOrgChartProxy modifies org chart
*/
class OrgPageEvents
{
    /**
     * CRUD Events are general and not owned by modals  Instead, they're owned by the page that opens the modal
     */
    public static readonly ADD_EMPLOYEE: string = "ADD_EMPLOYEE";
    public static readonly EDIT_EMPLOYEE: string = "EDIT_EMPLOYEE";
    public static readonly DELETE_EMPLOYEE: string = "DELETE_EMPLOYEE";
    public static readonly ADD_TEAM: string = "ADD_TEAM";
    public static readonly EDIT_TEAM: string = "EDIT_TEAM";

    public static readonly EDIT_TEAM_ACTION: string = "EDIT_TEAM_ACTION";
    public static readonly EDIT_EMPLOYEE_ACTION: string = "EDIT_EMPLOYEE_ACTION";
    public static readonly DELETE_EMPLOYEE_ACTION: string = "DELETE_EMPLOYEE_ACTION";

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

class NewTeamEvent extends BasePubSubEvent
{
    constructor(public readonly title: string, public managerId: string)
    {
        super(OrgPageEvents.ADD_TEAM);
    }
}

class EditTeamEvent extends BasePubSubEvent
{
    constructor(public readonly teamName: string, public teamToEdit: Team)
    {
        super(OrgPageEvents.EDIT_TEAM);
    }
}

class EditTeamActionEvent extends BasePubSubEvent
{
    constructor(public teamToEdit: Team)
    {
        super(OrgPageEvents.EDIT_TEAM_ACTION);
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
    SaveAsImageEvent,
    EditTeamActionEvent,
    NewTeamEvent,
    EditTeamEvent
};