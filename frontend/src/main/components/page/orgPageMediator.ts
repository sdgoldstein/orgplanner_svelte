import {PubSubManager, type PubSubEvent, type PubSubListener} from "orgplanner-common/jscore";
import {
    OrgEntityTypes,
    OrgStructureChangedEventEntitiesMoved,
    type Employee,
    type Manager,
    type OrgEntity,
    type OrgStructure,
    type Team
} from "orgplanner-common/model";
import {
    DeleteEmployeeEvent,
    DeleteTeamEvent,
    EditEmployeeEvent,
    EditTeamEvent,
    NewEmployeeAndTeamEvent,
    NewEmployeeEvent,
    NewTeamEvent,
    OrgPageEvents,
    SaveAsImageEvent
} from "./orgPageEvents";
import {
    OrgStructureChangedEventEntitiesAdded,
    OrgStructureChangedEventEntityEdited,
    OrgStructureChangedEventEntitiesRemoved
} from "orgplanner-common/model";
import {OrgChartEditingToolbarEvents} from "../orgchart/toolbar/OrgChartEditingToolbar.svelte";
import {OrgChartEvents, OrgChartSelectionChangedEvent, DropEntityOnEntityMouseEvent} from "orgplanner-orgchart";

interface OrgPageMediator
{
    init(): void;
    reset(): void;
    getFirstSelectedManager(): Manager;
    getFirstSelectedEntity(): OrgEntity;
    getSelectedEntities(): OrgEntity[];
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
        PubSubManager.instance.registerListener(OrgPageEvents.DELETE_TEAM, this);
        PubSubManager.instance.registerListener(OrgPageEvents.ADD_TEAM, this);
        PubSubManager.instance.registerListener(OrgPageEvents.ADD_EMPLOYEE_AND_TEAM, this);
        PubSubManager.instance.registerListener(OrgPageEvents.EDIT_TEAM, this);
        PubSubManager.instance.registerListener(OrgChartEvents.ORG_CHART_SELECTION_CHANGED_EVENT, this);
        PubSubManager.instance.registerListener(OrgChartEvents.DROP_ENTITY_ON_ENTITY_MOUSE_EVENT, this);
        PubSubManager.instance.registerListener(OrgChartEditingToolbarEvents.SAVE_AS_IMAGE_TOOLBAR_ACTION, this);
        PubSubManager.instance.registerListener(OrgPageEvents.CREATE_SNAPSHOT, this);
    }

    reset()
    {
        PubSubManager.instance.unregisterListener(OrgPageEvents.ADD_EMPLOYEE, this);
        PubSubManager.instance.unregisterListener(OrgPageEvents.EDIT_EMPLOYEE, this);
        PubSubManager.instance.unregisterListener(OrgPageEvents.DELETE_EMPLOYEE, this);
        PubSubManager.instance.unregisterListener(OrgPageEvents.DELETE_TEAM, this);
        PubSubManager.instance.unregisterListener(OrgPageEvents.ADD_TEAM, this);
        PubSubManager.instance.unregisterListener(OrgPageEvents.ADD_EMPLOYEE_AND_TEAM, this);
        PubSubManager.instance.unregisterListener(OrgPageEvents.EDIT_TEAM, this);
        PubSubManager.instance.unregisterListener(OrgChartEvents.ORG_CHART_SELECTION_CHANGED_EVENT, this);
        PubSubManager.instance.unregisterListener(OrgChartEvents.DROP_ENTITY_ON_ENTITY_MOUSE_EVENT, this);
        PubSubManager.instance.unregisterListener(OrgChartEditingToolbarEvents.SAVE_AS_IMAGE_TOOLBAR_ACTION, this);
        PubSubManager.instance.unregisterListener(OrgPageEvents.CREATE_SNAPSHOT, this);
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

    getFirstSelectedEntity(): OrgEntity
    {
        return this._currentSelection[0] as OrgEntity;
    }

    getSelectedEntities(): OrgEntity[]
    {
        return this._currentSelection;
    }

    onEvent(eventName: string, eventToHandle: PubSubEvent): void
    {
        if (eventName === OrgPageEvents.ADD_EMPLOYEE)
        {
            const newEmployeeEvent = eventToHandle as NewEmployeeEvent;
            const newEmployee = this._orgStructure.createEmployee(
                newEmployeeEvent.name, newEmployeeEvent.title, newEmployeeEvent.managerId, newEmployeeEvent.teamId,
                newEmployeeEvent.isManager, newEmployeeEvent.properties);
            const orgStructureChangedEvent = new OrgStructureChangedEventEntitiesAdded([ newEmployee ]);
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
        else if (eventName == OrgChartEvents.ORG_CHART_SELECTION_CHANGED_EVENT)
        {
            const selectionChangedEvent = eventToHandle as OrgChartSelectionChangedEvent;
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
        else if (eventName === OrgPageEvents.DELETE_TEAM)
        {
            const deleteTeamEvent = eventToHandle as DeleteTeamEvent;
            const teamsToDelete: Team[] = [ deleteTeamEvent.teamToDelete ];
            this._orgStructure.removeTeams(teamsToDelete);
            const orgStructureChangedEvent = new OrgStructureChangedEventEntitiesRemoved(teamsToDelete);
            PubSubManager.instance.fireEvent(orgStructureChangedEvent);
        }
        else if (eventName === OrgPageEvents.ADD_TEAM)
        {
            const newTeamEvent = eventToHandle as NewTeamEvent;
            const newTeam = this._orgStructure.createTeam(newTeamEvent.title, newTeamEvent.managerId);
            const orgStructureChangedEvent = new OrgStructureChangedEventEntitiesAdded([ newTeam ]);
            PubSubManager.instance.fireEvent(orgStructureChangedEvent);
        }
        else if (eventName === OrgPageEvents.ADD_EMPLOYEE_AND_TEAM)
        {
            const newEmployeeAndTeamEvent = eventToHandle as NewEmployeeAndTeamEvent;

            const newTeam =
                this._orgStructure.createTeam(newEmployeeAndTeamEvent.title, newEmployeeAndTeamEvent.managerId);

            const newEmployee = this._orgStructure.createEmployee(
                newEmployeeAndTeamEvent.name, newEmployeeAndTeamEvent.title, newEmployeeAndTeamEvent.managerId,
                newTeam.id, newEmployeeAndTeamEvent.isManager, newEmployeeAndTeamEvent.properties);
            const orgStructureChangedEvent = new OrgStructureChangedEventEntitiesAdded([ newTeam, newEmployee ]);
            PubSubManager.instance.fireEvent(orgStructureChangedEvent);
        }
        else if (eventName === OrgPageEvents.EDIT_TEAM)
        {
            const editTeamEvent: EditTeamEvent = eventToHandle as EditTeamEvent;
            const teamToEdit: Team = editTeamEvent.teamToEdit;
            teamToEdit.title = editTeamEvent.title;

            const orgStructureChangedEvent = new OrgStructureChangedEventEntityEdited(teamToEdit);
            PubSubManager.instance.fireEvent(orgStructureChangedEvent);
        }
        else if (eventName === OrgChartEditingToolbarEvents.SAVE_AS_IMAGE_TOOLBAR_ACTION)
        {
            const orgStructureChangedEvent = new SaveAsImageEvent();
            PubSubManager.instance.fireEvent(orgStructureChangedEvent);
        }
        else if (eventName === OrgPageEvents.CREATE_SNAPSHOT)
        {
        }
        else if (eventName === OrgChartEvents.DROP_ENTITY_ON_ENTITY_MOUSE_EVENT)
        {
            const dropEvent = eventToHandle as DropEntityOnEntityMouseEvent;
            const sourceEntity = dropEvent.sourceEntity;
            const targetEntity = dropEvent.targetEntity;
            const sourceEntityType = sourceEntity.orgEntityType;
            const targetEntityType = targetEntity.orgEntityType;

            /*
            Scenarios:
            1.  IC moves to new Manager
            2.  Manager moves to new Manaager
            3.  IC move to new Team
            4.  Manager move to new Team
            5.  Team moves to new Manager
            */
            // FIXME - lots of copied code
            if (sourceEntityType === OrgEntityTypes.MANAGER)
            {
                if (targetEntityType === OrgEntityTypes.TEAM)
                {
                    const previousManagerId = (targetEntity as Team).managerId;
                    const previousManager = this._orgStructure.getEmployee(previousManagerId);
                    const movedTeam =
                        this._orgStructure.moveTeamToManager(targetEntity as Team, sourceEntity as Manager);
                    const orgStructureEntityMovedEvent =
                        new OrgStructureChangedEventEntitiesMoved(movedTeam, sourceEntity, previousManager);
                    PubSubManager.instance.fireEvent(orgStructureEntityMovedEvent);
                }
                else
                {
                    const previousManagerId = (targetEntity as Employee).managerId;
                    const previousManager = this._orgStructure.getEmployee(previousManagerId);
                    const movedEmployee =
                        this._orgStructure.moveEmployeeToManager(targetEntity as Employee, sourceEntity as Manager);
                    const orgStructureEntityMovedEvent =
                        new OrgStructureChangedEventEntitiesMoved(movedEmployee, sourceEntity, previousManager);
                    PubSubManager.instance.fireEvent(orgStructureEntityMovedEvent);
                }
            }
            else if (targetEntityType === OrgEntityTypes.TEAM)
            {
                const previousTeam = (targetEntity as Employee).team;
                const movedEmployee =
                    this._orgStructure.moveEmployeeToTeam(targetEntity as Employee, sourceEntity as Team);
                const orgStructureEntityMovedEvent =
                    new OrgStructureChangedEventEntitiesMoved(movedEmployee, sourceEntity, previousTeam);
                PubSubManager.instance.fireEvent(orgStructureEntityMovedEvent);
            }
        }
    }
}

export {DefaultOrgPageMediator};
export type{OrgPageMediator};
