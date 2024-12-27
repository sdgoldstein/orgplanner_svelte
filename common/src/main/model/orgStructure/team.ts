import {type OrgEntity, type OrgEntityType, OrgEntityTypes} from "./orgEntity";
import {
    BaseJSONSerializer,
    RegisterSerializable,
    RegisterSerializer,
    SerializationFormat,
    type SerializationHelper,
    type Serializer
} from "orgplanner-common/jscore";

// FIXME - Need to remove the concept of a NO_TEAM_ID and just make Team optional on the Employee
class TeamConstants
{
    static readonly NO_TEAM_ID: string = "NO_TEAM_ID";
    static readonly NO_TEAM_TITLE: string = "-- No Team --";
}

/**
 * Team represents a scrum
 */
interface Team extends OrgEntity
{
    readonly id: string;
    title: string;
    managerId: string; // FIXME - Should be Manager, but hard to do with TreeStructure and import/export
}

@RegisterSerializable("Team", 1)
class BaseTeam implements Team
{
    orgEntityType: OrgEntityType = OrgEntityTypes.TEAM;

    constructor(private readonly _id: string, private _title: string, private _managerId: string,
                private _canDelete: boolean)
    {
    }

    get id(): string
    {
        return this._id;
    }

    get title(): string
    {
        return this._title;
    }

    set title(titleToSet: string)
    {
        this._title = titleToSet;
    }

    get managerId(): string
    {
        return this._managerId;
    }

    set managerId(value: string)
    {
        this._managerId = value;
    }

    canDelete(): boolean
    {
        return this._canDelete;
    }

    clone(): Team
    {
        return new BaseTeam(this._id, this._title, this._managerId, this._canDelete);
    }
}

@RegisterSerializer("Team", SerializationFormat.JSON)
class BaseTeamSerializer extends BaseJSONSerializer<Team> implements Serializer<Team, SerializationFormat.JSON>
{
    deserializeObject(dataObject: any, serializationHelper: SerializationHelper<SerializationFormat.JSON>): Team
    {
        throw new Error("Method not implemented.");
    }
    getValue(serializableObject: BaseTeam,
             serializationHelper: SerializationHelper<SerializationFormat.JSON>): Record<string, string>
    {
        const valueToReturn: Record<string, string> = {};

        valueToReturn["id"] = serializableObject.id;
        valueToReturn["title"] = serializableObject.title;
        valueToReturn["managerId"] = serializableObject.managerId;

        return valueToReturn;
    }
}

export {BaseTeam, TeamConstants, BaseTeamSerializer};
export type{Team};
