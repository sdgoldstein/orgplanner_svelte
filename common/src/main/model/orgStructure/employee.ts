
import {
    type OrgEntity,
    type OrgEntityPropertyBag,
    type OrgEntityPropertyCarrier,
    type OrgEntityPropertyDescriptor,
    OrgEntityPropertyDescriptorImpl,
    type OrgEntityType,
    OrgEntityTypes,
    PropertyCarrierHelper
} from "./orgEntity";
import type {Team} from "./team";
import {
    BaseJSONSerializer,
    RegisterSerializer,
    RegisterSerializable,
    SerializationFormat,
    type SerializationHelper,
    type Serializer
} from "orgplanner-common/jscore";

class EmployeeReservedPropertyDescriptors
{
    private static readonly NAME_TO_DESCRIPTOR_MAP: Map<string, OrgEntityPropertyDescriptor> =
        new Map<string, OrgEntityPropertyDescriptor>();

    static readonly LOCATION: OrgEntityPropertyDescriptor = new OrgEntityPropertyDescriptorImpl(
        "LOCATION_PROPERTY_DESCRIPTOR", "Location", "San Francisco", true, 3, true, true);

    static readonly PHONE: OrgEntityPropertyDescriptor =
        new OrgEntityPropertyDescriptorImpl("PHONE_PROPERTY_DESCRIPTOR", "Phone", "999-999-9999", false, 4, true, true);

    static
    {
        EmployeeReservedPropertyDescriptors.NAME_TO_DESCRIPTOR_MAP.set(this.LOCATION.name, this.LOCATION);
        EmployeeReservedPropertyDescriptors.NAME_TO_DESCRIPTOR_MAP.set(this.PHONE.name, this.PHONE);
    }

    static getPropertyDescriptorByName(name: string): OrgEntityPropertyDescriptor
    {
        const valueToReturn = this.NAME_TO_DESCRIPTOR_MAP.get(name);
        if (valueToReturn === undefined)
        {
            throw new Error("Property Descriptor by name not found, " + name);
        }

        return valueToReturn;
    }

    static themeIterator(): IterableIterator<OrgEntityPropertyDescriptor>
    {
        return this.NAME_TO_DESCRIPTOR_MAP.values();
    }
}

/**
 * An interface representing a Person
 */
interface Person extends OrgEntity, OrgEntityPropertyCarrier
{
    name: string;
}

/**
 * An interface representing an employee.  Employee instances are nodes in the org structure
 */
interface Employee extends Person
{
    title: string;
    managerId: string;
    team: Team;

    /**
     * Determine if this employee is a manager
     *
     * @returns {boolean} true if a manager; false otherwise
     */
    isManager(): boolean;
}

/**
 * Marker interface representing a manager.
 */
type Manager = Employee

/**
 * Marker interface representing an individual contributor.
 */
type IndividualContributor = Employee;

@RegisterSerializable("Person", 1)
abstract class BasePerson implements Person
{
    abstract orgEntityType: OrgEntityType;
    abstract readonly id: string;

    private readonly _propertyHelper: PropertyCarrierHelper

    constructor(public name: string, private _canDelete: boolean, private _canMove: boolean,
                propertyDescriptors: Set<OrgEntityPropertyDescriptor>, properties: OrgEntityPropertyBag)
    {
        this._propertyHelper = new PropertyCarrierHelper(propertyDescriptors, properties);
    }

    getPropertyValue(propertyName: string): string
    {
        return this._propertyHelper.getPropertyValue(propertyName);
    }
    setPropertyValue(propertyName: string, value: string): void
    {
        this._propertyHelper.setPropertyValue(propertyName, value);
    }

    propertyDescriptorIterator(): IterableIterator<OrgEntityPropertyDescriptor>
    {
        return this._propertyHelper.propertyDescriptorIterator();
    }

    canDelete(): boolean
    {
        return this._canDelete;
    }

    canMove(): boolean
    {
        return this._canMove;
    }
}

@RegisterSerializable("Employee", 1)
abstract class BaseEmployee extends BasePerson implements Employee
{
    private readonly _id: string;
    private _managerId: string;

    protected constructor(id: string, name: string, public title: string, managerId: string, public team: Team,
                          canDelete: boolean, canMove: boolean, propertyDescriptors: Set<OrgEntityPropertyDescriptor>,
                          properties: OrgEntityPropertyBag)
    {
        super(name, canDelete, canMove, propertyDescriptors, properties);

        this._id = id;
        this._managerId = managerId;
    }

    get id(): string
    {
        return this._id;
    }

    get managerId(): string
    {
        return this._managerId;
    }

    set managerId(managerId: string)
    {
        this._managerId = managerId;
    }

    abstract isManager(): boolean;

    // abstract clone(): Employee;
}

@RegisterSerializable("Manager", 1)
class BaseManager extends BaseEmployee implements Manager
{
    orgEntityType: OrgEntityType = OrgEntityTypes.MANAGER;

    constructor(id: string, name: string, title: string, managerId: string, team: Team, canDelete: boolean,
                canMove: boolean, propertyDescriptors: Set<OrgEntityPropertyDescriptor>,
                properties: OrgEntityPropertyBag)
    {
        super(id, name, title, managerId, team, canDelete, canMove, propertyDescriptors, properties);
    }

    isManager(): boolean
    {
        return true;
    }

    /*clone(): Manager
    {
        return new BaseManager(this.id, this.name, this.title, this.managerId, this.team);
    }*/
}

@RegisterSerializable("IndividualContributor", 1)
class BaseIndividualContributor extends BaseEmployee implements IndividualContributor
{
    orgEntityType: OrgEntityType = OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR;

    constructor(id: string, name: string, title: string, managerId: string, team: Team, canDelete: boolean,
                canMove: boolean, propertyDescriptors: Set<OrgEntityPropertyDescriptor>,
                properties: OrgEntityPropertyBag)
    {
        super(id, name, title, managerId, team, canDelete, canMove, propertyDescriptors, properties);
    }

    isManager(): boolean
    {
        return false;
    }

    /*clone(): Manager
    {
        return new BaseIndividualContributor(this.id, this.name, this.title, this.managerId, this.team);
    }*/
}

@RegisterSerializer("Person", SerializationFormat.JSON)
class BasePersonSerializer extends BaseJSONSerializer<Person> implements Serializer<Person, SerializationFormat.JSON>
{
    deserializeObject(dataObject: any, serializationHelper: SerializationHelper<SerializationFormat.JSON>): Person
    {
        throw new Error("Method not implemented.");
    }
    getValue(serializableObject: BasePerson,
             serializationHelper: SerializationHelper<SerializationFormat.JSON>): Record<string, string>
    {
        const valueToReturn: Record<string, string> = {};

        valueToReturn["id"] = serializableObject.id;
        valueToReturn["name"] = serializableObject.name;

        // FIXME - This is SO BAD.  Copying from iterable because I don't know what else to do at this point
        let json = "[";

        const serializableIterator = serializableObject.propertyDescriptorIterator();
        let nextSerializable = serializableIterator.next();
        while (!nextSerializable.done)
        {
            const nextPropertyName = nextSerializable.value.name;
            json += `{"name":"${nextPropertyName}",\n`;
            json += `"value":"${serializableObject.getPropertyValue(nextPropertyName)}"}\n`;

            nextSerializable = serializableIterator.next();

            if (!nextSerializable.done)
            {
                json += ",";
            }
        }

        json += "]";

        valueToReturn["properties"] = json;

        return valueToReturn;
    }
}

@RegisterSerializer("Employee", SerializationFormat.JSON)
class BaseEmployeeSerializer extends BasePersonSerializer implements Serializer<Employee, SerializationFormat.JSON>
{
    getValue(serializableObject: BaseEmployee,
             serializationHelper: SerializationHelper<SerializationFormat.JSON>): Record<string, string>
    {
        const valueToReturn: Record<string, string> = super.getValue(serializableObject, serializationHelper);

        valueToReturn["title"] = serializableObject.title;
        valueToReturn["managerId"] = serializableObject.managerId;
        valueToReturn["teamId"] = serializableObject.team.id;

        return valueToReturn;
    }

    deserialize(data: string, serializationHelper: SerializationHelper<SerializationFormat.JSON>): Employee
    {
        throw new Error("Method not implememtned");
    }
}

@RegisterSerializer("Manager", SerializationFormat.JSON)
class BaseManagerSerializer extends BaseEmployeeSerializer implements Serializer<Manager, SerializationFormat.JSON>
{
    getValue(serializableObject: BaseEmployee,
             serializationHelper: SerializationHelper<SerializationFormat.JSON>): Record<string, string>
    {
        const valueToReturn: Record<string, string> = super.getValue(serializableObject, serializationHelper);

        valueToReturn["isManager"] = serializableObject.isManager().toString();

        return valueToReturn;
    }

    deserializeObject(dataObject: any, serializationHelper: SerializationHelper<SerializationFormat.JSON>): Person
    {
        throw new Error("Method not implemented.");
    }
}

@RegisterSerializer("IndividualContributor", SerializationFormat.JSON)
class BaseIndividualContributorSerializer extends BaseEmployeeSerializer implements
    Serializer<IndividualContributor, SerializationFormat.JSON>
{
    getValue(serializableObject: BaseEmployee,
             serializationHelper: SerializationHelper<SerializationFormat.JSON>): Record<string, string>
    {
        const valueToReturn: Record<string, string> = super.getValue(serializableObject, serializationHelper);

        valueToReturn["isManager"] = serializableObject.isManager().toString();

        return valueToReturn;
    }

    deserializeObject(dataObject: any, serializationHelper: SerializationHelper<SerializationFormat.JSON>): Person
    {
        throw new Error("Method not implemented.");
    }
}

/*class UnmodifiablePerson implements Person
{
    private _wrappedPerson: Person;

    constructor(wrappedPerson: Person)
    {
        this._wrappedPerson = wrappedPerson;
    }

    private get wrappedPerson(): Person
    {
        return this._wrappedPerson;
    }

    public get name(): string
    {
        return this.wrappedPerson.name;
    }

    public set name(value: string)
    {
        throw new Error("Unmodifiable Person");
    }

    getProperty(propertyName: string): string
    {
        return this.wrappedPerson.getProperty(propertyName);
    }
    setProperty(propertyName: string, value: string): void
    {
        throw new Error("Unmodifiable Person");
    }
}*/

/*abstract class UnmodifiableEmpoloyee extends UnmodifiablePerson implements Employee
{
    private _wrappedEmployee: Employee;

    constructor(wrappedEmployee: Employee)
    {
        super(wrappedEmployee);
        this._wrappedEmployee = wrappedEmployee;
    }

    public get id(): string
    {
        return this._wrappedEmployee.id;
    }

    public get title(): string
    {
        return this._wrappedEmployee.title;
    }

    public set title(value: string)
    {
        this._throwUnmodifiableError();
    }

    get managerId(): string
    {
        return this._wrappedEmployee.managerId;
    }

    public set managerId(value: string)
    {
        this._throwUnmodifiableError();
    }

    get team(): Team
    {
        return this._wrappedEmployee.team;
    }

    public set team(value: Team)
    {
        this._throwUnmodifiableError();
    }

    private _throwUnmodifiableError(): void
    {
        throw new Error("Unmodifiable Employee");
    }

    isManager(): boolean
    {
        return this._wrappedEmployee.isManager();
    }
}*/

/*class UnmodifiableManager extends UnmodifiableEmpoloyee implements Manager
{
    private _wrappedManager: Manager;

    constructor(wrappedManager: Manager)
    {
        super(wrappedManager);
        this._wrappedManager = wrappedManager;
    }

    private get wrappedManager(): Manager
    {
        return this._wrappedManager;
    }
}*/

/*class UnmodifiableIndividualContributor extends UnmodifiableEmpoloyee implements IndividualContributor
{
    private _wrappedIndividualContributor: IndividualContributor;

    constructor(wrappedIndividualContributor: IndividualContributor)
    {
        super(wrappedIndividualContributor);
        this._wrappedIndividualContributor = wrappedIndividualContributor;
    }

    private get wrappedIndividualContributor(): IndividualContributor
    {
        return this._wrappedIndividualContributor;
    }
}*/

export {
    BaseIndividualContributor,
    BaseManager,
    EmployeeReservedPropertyDescriptors,
    BaseManagerSerializer,
    BaseIndividualContributorSerializer,
};
export type{Person, Employee, Manager, IndividualContributor};
