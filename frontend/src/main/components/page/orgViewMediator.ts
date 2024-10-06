import {BasePubSubEvent, PubSubManager, type PubSubEvent, type PubSubListener} from "orgplanner-common/jscore";
import {OrgEntityTypes, type Manager, type OrgEntity, type OrgStructure} from "orgplanner-common/model";
import {OrgPlannerAppEvents} from "../app/orgPlannerAppEvents";
import type {NewEmployeeEvent} from "../orgchart/modal/NewEmployeeModal.svelte";
import type {Employee} from "../../../../../common/src/main/model/orgStructure/employee";

interface OrgStructureChangedEvent extends PubSubEvent
{
}

class OrgViewEvents
{
    public static readonly SELECTION_CHANGED_EVENT: string = "SELECTION_CHANGED";
    public static readonly EDIT_EMPLOYEE_ACTION: string = "EDIT_EMPLOYEE_ACTION";
}

class OrgStructureChangedEvents
{
    public static readonly ORG_ENTITY_ADDED: string = "ORG_ENTITY_ADDED";
}

class OrgStructureChangedEventEntityAdded extends BasePubSubEvent
{
    constructor(public entityAded: OrgEntity)
    {
        super(OrgStructureChangedEvents.ORG_ENTITY_ADDED)
    }
}

class OrgViewSelectionChangedEvent extends BasePubSubEvent
{
    constructor(public newSelectedEntities: OrgEntity[])
    {
        super(OrgViewEvents.SELECTION_CHANGED_EVENT);
    }
}

class EditEmployeeActionEvent extends BasePubSubEvent
{
    constructor(public employeeToEdit: Employee)
    {
        super(OrgViewEvents.EDIT_EMPLOYEE_ACTION);
    }
}
interface OrgViewMediator
{
    init(): void;
    reset(): void;
    getFirstSelectedManager(): Manager;
}

class DefaultOrgViewMediator implements PubSubListener, OrgViewMediator
{
    private _currentSelection: OrgEntity[] = [];

    constructor(private _orgStructure: OrgStructure) {}

    init()
    {
        PubSubManager.instance.registerListener(OrgPlannerAppEvents.ADD_EMPLOYEE, this);
    }

    reset()
    {
        PubSubManager.instance.unregisterListener(OrgPlannerAppEvents.ADD_EMPLOYEE, this);
    }

    getFirstSelectedManager(): Manager
    {
        let managerToReturn: Manager|undefined;

        for (let i = 0; i < this._currentSelection.length && managerToReturn == undefined; i++)
        {
            if (this._currentSelection[i].orgEntityType == OrgEntityTypes.MANAGER)
            {
                managerToReturn = this._currentSelection[i] as Manager;
            }
        }

        if (managerToReturn == undefined)
        {
            managerToReturn = this._orgStructure.orgLeader;
        }

        return managerToReturn;
    }

    onEvent(eventName: string, eventToHandle: PubSubEvent): void
    {
        if (eventName === OrgPlannerAppEvents.ADD_EMPLOYEE)
        {
            const newEmployeeEvent = eventToHandle as NewEmployeeEvent;
            const newEmployee = this._orgStructure.createEmployee(
                newEmployeeEvent.name, newEmployeeEvent.title, newEmployeeEvent.managerId, newEmployeeEvent.teamId,
                newEmployeeEvent.isManager, newEmployeeEvent.properties);
            const orgStructureChangedEvent = new OrgStructureChangedEventEntityAdded(newEmployee);
            PubSubManager.instance.fireEvent(orgStructureChangedEvent);
        }
        else if (eventName = OrgViewEvents.SELECTION_CHANGED_EVENT)
        {
            const selectionChangedEvent = eventToHandle as OrgViewSelectionChangedEvent;
            this._currentSelection = selectionChangedEvent.newSelectedEntities;
        }
    }
}

export {
    DefaultOrgViewMediator,
    OrgStructureChangedEventEntityAdded,
    OrgStructureChangedEvents,
    OrgViewEvents,
    EditEmployeeActionEvent
};
export type{OrgViewMediator};
