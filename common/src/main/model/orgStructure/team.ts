import {OrgEntity, OrgEntityType, OrgEntityTypes} from "./orgEntity";

/**
 * Team represents a scrum
 */
interface Team extends OrgEntity
{
    readonly id: string;
    title: string;
    managerId: string; // FIXME - Should be Manager, but hard to do with TreeStructure and import/export
}

class BaseTeam implements Team
{
    orgEntityType: OrgEntityType = OrgEntityTypes.TEAM;

    private readonly _id: string;
    private _title: string;
    private _managerId: string;

    constructor(id: string, title: string, managerId = "Unknown")
    {
        this._id = id;
        this._title = title;
        this._managerId = managerId;
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

    clone(): Team
    {
        return new BaseTeam(this._id, this._title, this._managerId);
    }
}

export {BaseTeam};
export type {Team};
