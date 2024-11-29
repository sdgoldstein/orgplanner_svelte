import {PubSubManager, type PubSubEvent, type PubSubListener} from "orgplanner-common/jscore";
import {OrgEntityTypes, type Employee, type Manager, type OrgEntity, type OrgStructure} from "orgplanner-common/model";
import {
    DeleteEmployeeEvent,
    EditEmployeeEvent,
    NewEmployeeEvent,
    OrgPageEvents,
    OrgPageSelectionChangedEvent,
    SaveAsImageEvent
} from "./orgPageEvents";
import {
    OrgStructureChangedEventEntityAdded,
    OrgStructureChangedEventEntityEdited,
    OrgStructureChangedEventEntitiesRemoved
} from "../../../../../common/src/main/model/orgStructure/orgStructureEvents";

interface OrgPageMediator
{
    init(): void;
    reset(): void;
    getFirstSelectedManager(): Manager;
    getFirstSelectedEmployee(): Employee;
}

class DefaultOrgPageMediator implements PubSubListener, OrgPageMediator
{
    private _currentSelection: OrgEntity[] = [];

    constructor(private _orgStructure: OrgStructure) {}

    init()
    {
        PubSubManager.instance.registerListener(OrgPageEvents.ADD_EMPLOYEE, this);
        PubSubManager.instance.registerListener(OrgPageEvents.EDIT_EMPLOYEE, this);
        PubSubManager.instance.registerListener(OrgPageEvents.DELETE_EMPLOYEE, this);
        PubSubManager.instance.registerListener(OrgPageEvents.SELECTION_CHANGED_EVENT, this);
        PubSubManager.instance.registerListener(OrgPageEvents.SAVE_AS_IMAGE_TOOLBAR_ACTION, this);
    }

    reset()
    {
        PubSubManager.instance.unregisterListener(OrgPageEvents.ADD_EMPLOYEE, this);
        PubSubManager.instance.unregisterListener(OrgPageEvents.EDIT_EMPLOYEE, this);
        PubSubManager.instance.unregisterListener(OrgPageEvents.DELETE_EMPLOYEE, this);
        PubSubManager.instance.unregisterListener(OrgPageEvents.SELECTION_CHANGED_EVENT, this);
        PubSubManager.instance.unregisterListener(OrgPageEvents.SAVE_AS_IMAGE_TOOLBAR_ACTION, this);
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

    getFirstSelectedEmployee(): Employee
    {
        return this._currentSelection[0] as Employee;
    }

    onEvent(eventName: string, eventToHandle: PubSubEvent): void
    {
        if (eventName === OrgPageEvents.ADD_EMPLOYEE)
        {
            const newEmployeeEvent = eventToHandle as NewEmployeeEvent;
            const newEmployee = this._orgStructure.createEmployee(
                newEmployeeEvent.name, newEmployeeEvent.title, newEmployeeEvent.managerId, newEmployeeEvent.teamId,
                newEmployeeEvent.isManager, newEmployeeEvent.properties);
            const orgStructureChangedEvent = new OrgStructureChangedEventEntityAdded(newEmployee);
            PubSubManager.instance.fireEvent(orgStructureChangedEvent);
        }
        else if (eventName === OrgPageEvents.EDIT_EMPLOYEE)
        {
            const editEmployeeEvent: EditEmployeeEvent = eventToHandle as EditEmployeeEvent;
            const employeeToEdit: Employee = editEmployeeEvent.employeeToEdit;
            employeeToEdit.name = editEmployeeEvent.name;
            employeeToEdit.title = editEmployeeEvent.title;
            employeeToEdit.team = this._orgStructure.getTeam(editEmployeeEvent.teamId);

            editEmployeeEvent.properties.forEach((nextPropertyValue, nextPropertyDescriptor) => {
                employeeToEdit.setPropertyValue(nextPropertyDescriptor.name, nextPropertyValue);
            })

            const orgStructureChangedEvent = new OrgStructureChangedEventEntityEdited(employeeToEdit);
            PubSubManager.instance.fireEvent(orgStructureChangedEvent);
        }
        else if (eventName == OrgPageEvents.SELECTION_CHANGED_EVENT)
        {
            const selectionChangedEvent = eventToHandle as OrgPageSelectionChangedEvent;
            this._currentSelection = selectionChangedEvent.newSelectedEntities;
        }
        else if (eventName === OrgPageEvents.DELETE_EMPLOYEE)
        {
            const deleteEmployeeEvent = eventToHandle as DeleteEmployeeEvent;
            const employeesToDelete: Employee[] = [ deleteEmployeeEvent.employeeToDelete ];
            this._orgStructure.removeEmployees(employeesToDelete);
            const orgStructureChangedEvent = new OrgStructureChangedEventEntitiesRemoved(employeesToDelete);
            PubSubManager.instance.fireEvent(orgStructureChangedEvent);
        }
        else if (eventName === OrgPageEvents.SAVE_AS_IMAGE_TOOLBAR_ACTION)
        {
            const orgStructureChangedEvent = new SaveAsImageEvent();
            PubSubManager.instance.fireEvent(orgStructureChangedEvent);
        }
    }
}

export {DefaultOrgPageMediator};
export type{OrgPageMediator};
