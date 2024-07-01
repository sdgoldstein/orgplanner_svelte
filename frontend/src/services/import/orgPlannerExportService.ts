import {BaseService, type Service} from "@sphyrna/service-manager-ts";
import type {OrgPlanner} from "@src/model/orgPlanner";
import type {
    Employee, OrgDataCore, OrgEntityColorTheme, OrgEntityPropertyDescriptor, OrgSnapshot, OrgStructureVisitor,
    Team} from "orgplanner-common/model";

class JSONStringBuilder
{
    private _commaNeeded: boolean = false;
    private _json: string = "{";
    private _indentLevel = 1;

    private appendPre(): void
    {
        this._addCommaIfNeeded();
        this._addLineAndIndent();
    }

    appendKey(key: string, value: string): void
    {
        this.appendPre();
        this._json += `"${key}": "${value}"`;
        this._setCommaNeeded();
    }

    appendBooleanKey(key: string, value: boolean): void
    {
        this.appendPre();
        this._json += `"${key}": ${value}`;
        this._setCommaNeeded();
    }

    appendObjectKey(key: string): void
    {
        this.appendPre();
        this._json += `"${key}": {`;
        this._indentLevel++;
    }

    appendArrayKey(key: string): void
    {
        this.appendPre();
        this._json += `"${key}": [`;
        this._indentLevel++;
    }

    appendArrayObjectValue(): void
    {
        this.appendPre();
        this._json += "{";
        this._indentLevel++;
    }

    closeArrayObjectValue(): void
    {
        this._indentLevel--;
        this._addLineAndIndent();
        this._json += "}";
        this._setCommaNeeded();
    }

    closeArrayKey(): void
    {
        this._indentLevel--;

        this._addLineAndIndent();

        this._json += "]";

        this._setCommaNeeded();
    }

    closeObjectKey(): void
    {
        this._indentLevel--;
        this._addLineAndIndent();
        this._json += "}";
        this._setCommaNeeded();
    }

    private _addLineAndIndent(): void
    {
        this._json += "\n";
        for (let i = 0; i < this._indentLevel; i++)
        {
            this._json += "\t";
        }
    }

    private _addCommaIfNeeded(): void
    {
        if (this._commaNeeded)
        {
            this._json += ",";
            this._commaNeeded = false;
        }
    }

    private _setCommaNeeded(): void
    {
        this._commaNeeded = true;
    }

    toString(): string
    {
        this._json += "\n}";
        return this._json;
    }
}

/**
 * JSONBuildingTreeVisitor is a TreeVisitor used to visit an org structure tree and produce a corresponding JSON
 * string
 */
class JSONBuildingTreeVisitor implements OrgStructureVisitor
{
    private _jsonBuilder: JSONStringBuilder;

    constructor(jsonBuilder: JSONStringBuilder)
    {
        this._jsonBuilder = jsonBuilder;
    }

    visitEnter(employee: Employee): void
    {
        this._jsonBuilder.appendArrayObjectValue();
        this._jsonBuilder.appendKey("id", employee.id);
        this._jsonBuilder.appendKey("name", employee.name);
        this._jsonBuilder.appendKey("title", employee.title);
        this._jsonBuilder.appendKey("managerId", employee.managerId);
        this._jsonBuilder.appendBooleanKey("isManager", employee.isManager());
        this._jsonBuilder.appendKey("teamId", employee.team.id);
        this._jsonBuilder.appendArrayKey("properties");
        for (const nextProperty in employee.propertyIterator)
        {
            this._jsonBuilder.appendKey("name", nextProperty[0]);
            this._jsonBuilder.appendKey("value", nextProperty[1]);
        }
        this._jsonBuilder.closeArrayKey();

        this._jsonBuilder.closeArrayObjectValue();
    }

    visitLeave(employee: Employee): void
    {
        // Empty
    }
}

interface OrgPlannerExportService extends Service
{
    exportSync(orgPlannerToExport: OrgPlanner): string;
    export(orgPlannerToExport: OrgPlanner): Promise<string>;
}

class OrgPlannerExportServiceDefaultImpl extends BaseService implements OrgPlannerExportService
{
    export(orgPlannerToExport: OrgPlanner): Promise<string>
    {
        return new Promise((resolve, reject) => {
            const jsonAugmented = this.exportSync(orgPlannerToExport);

            resolve(jsonAugmented);
        });
    }

    exportSync(orgPlannerToExport: OrgPlanner): string
    {
        const jsonBuilder: JSONStringBuilder = new JSONStringBuilder();
        jsonBuilder.appendObjectKey("orgPlanner");
        jsonBuilder.appendKey("orgTitle", orgPlannerToExport.orgTitle);
        jsonBuilder.appendObjectKey("settings");
        jsonBuilder.appendArrayKey("employeePropertyDescriptors");

        const orgPlannerSettings = orgPlannerToExport.settings;
        this._appendEmployeePropertyDescriptors(jsonBuilder, orgPlannerSettings.employeePropertyDescriptors);

        jsonBuilder.closeArrayKey();

        jsonBuilder.appendObjectKey("colorTheme");
        const colorTheme: OrgEntityColorTheme = orgPlannerSettings.colorTheme;
        for (const nextKey in colorTheme)
        {
            jsonBuilder.appendKey(nextKey, colorTheme[nextKey as keyof OrgEntityColorTheme]);
        }

        jsonBuilder.closeObjectKey();
        jsonBuilder.closeObjectKey();

        jsonBuilder.appendArrayKey("orgSnapshots");

        if (orgPlannerToExport.hasPresentOrg())
        {
            const orgSnapshot: OrgSnapshot = orgPlannerToExport.presentOrg!;

            this._appendOrgDataCore(jsonBuilder, orgSnapshot.orgDataCore);
        }

        jsonBuilder.closeArrayKey();

        jsonBuilder.appendArrayKey("planningProjects");
        jsonBuilder.appendArrayObjectValue();
        jsonBuilder.appendArrayKey("orgPlans");

        this._appendOrgDataCore(jsonBuilder, orgPlannerToExport.planningProject.orgPlan.orgDataCore);

        jsonBuilder.closeArrayKey();
        jsonBuilder.closeArrayObjectValue();
        jsonBuilder.closeArrayKey();
        jsonBuilder.closeObjectKey();

        orgPlannerToExport.planningProject;

        return jsonBuilder.toString();
    }
    private _appendEmployeePropertyDescriptors(jsonBuilder: JSONStringBuilder,
                                               employeePropertyDescriptors: Set<OrgEntityPropertyDescriptor>): void
    {
        for (const nextPropertyDescriptor of employeePropertyDescriptors)
        {
            jsonBuilder.appendArrayObjectValue();
            for (const nextKey in nextPropertyDescriptor)
            {
                jsonBuilder.appendKey(nextKey,
                                      nextPropertyDescriptor[nextKey as keyof OrgEntityPropertyDescriptor] as string);
            }
            jsonBuilder.closeArrayObjectValue();
        }
    }

    private _appendOrgDataCore(jsonBuilder: JSONStringBuilder, orgDataCore: OrgDataCore): void
    {
        // In the future, we'll have multiple snapshots
        jsonBuilder.appendArrayObjectValue();
        jsonBuilder.appendKey("title", orgDataCore.title)
        jsonBuilder.appendObjectKey("orgStructure");
        jsonBuilder.appendArrayKey("employees");

        const jsonBuildingTreeVisitor: JSONBuildingTreeVisitor = new JSONBuildingTreeVisitor(jsonBuilder);
        orgDataCore.orgStructure.traverseBF(jsonBuildingTreeVisitor);

        jsonBuilder.closeArrayKey();

        jsonBuilder.appendArrayKey("teams");

        // Now, we need to iteratore through teams
        const teamIterator: IterableIterator<Team> = orgDataCore.orgStructure.getTeams();
        for (const nextTeam of teamIterator)
        {
            jsonBuilder.appendArrayObjectValue();
            jsonBuilder.appendKey("id", nextTeam.id);
            jsonBuilder.appendKey("title", nextTeam.title);
            jsonBuilder.appendKey("managerId", nextTeam.managerId);
            jsonBuilder.closeArrayObjectValue();
        }
        jsonBuilder.closeArrayKey();
        jsonBuilder.closeArrayObjectValue();
        jsonBuilder.closeArrayObjectValue();
    }
}

export {OrgPlannerExportServiceDefaultImpl};
export type {OrgPlannerExportService};
