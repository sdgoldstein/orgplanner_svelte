import type {GuardedMap} from "@kameleon/tscore/jscore";
import {Cell, GraphDataModel} from "@maxgraph/core";
import type {Employee, IndividualContributor, Manager, OrgEntity, Team} from "orgplanner-common/model";

class OrgPlannerChartModel extends GraphDataModel
{
    public static readonly IC_MODE = "IC_MODE";
    public static readonly TEAM_MODE = "TEAM_MODE";

    private currentMode = OrgPlannerChartModel.IC_MODE;

    constructor()
    {
        super();
    }

    isVisible(cell: Cell): boolean
    {
        let visiblityToReturn = true;

        // FIX ME - Refactor horrible code
        const cellValue = cell.getValue();
        if ((cellValue) &&
            (((cellValue.getVertexType() == VertexType.TEAM) && (this.currentMode != OrgPlannerChartModel.TEAM_MODE)) ||
             ((cellValue.getVertexType() == VertexType.IC) && (this.currentMode != OrgPlannerChartModel.IC_MODE))))
        {
            visiblityToReturn = false;
        }
        else
        {
            visiblityToReturn = cell.isVisible();
        }

        return visiblityToReturn;
    }

    isLeafNode(cell: Cell): boolean
    {
        let isLeafNode = false;

        // FIX ME - Refactor horrible code
        const cellValue = cell.getValue();
        if ((cellValue) && (cellValue.getVertexType() == VertexType.IC))
        {
            isLeafNode = true;
        }

        return isLeafNode;
    }

    toggleTeamMode()
    {
        this.beginUpdate();
        if (this.currentMode === OrgPlannerChartModel.IC_MODE)
        {
            this.currentMode = OrgPlannerChartModel.TEAM_MODE;
        }
        else
        {
            this.currentMode = OrgPlannerChartModel.IC_MODE;
        }
        this.endUpdate();
    }
}

enum VertexType {
    MANAGER = "MANAGER",
    IC = "IC",
    TEAM = "TEAM",
}

// FIXME - With introduction of OrgEntity, do we need OrgPlannerChartVertex?
interface OrgPlannerChartVertex
{
    orgEntity: OrgEntity;
    getVertexType(): VertexType;
    setProperty(name: string, value: string): void;
    getProperty(name: string): string;
    hasProperty(name: string): boolean;
}

abstract class OrgPlannerChartEmployeeVertex implements OrgPlannerChartVertex
{
    orgEntity: Employee;
    private propertyMap: GuardedMap<string, string> = new Map<string, string>() as GuardedMap<string, string>;

    protected constructor(employee: Employee)
    {
        if (!employee)
        {
            throw new Error("employee cannot be null");
        }

        this.orgEntity = employee;
    }

    abstract getVertexType(): VertexType;

    get employee()
    {
        return this.orgEntity;
    }

    // FIXME - This is used for planning charts.  Consider having a read only version that doesn't have this!
    set employee(employeeToSet: Employee)
    {
        this.orgEntity = employeeToSet;
    }

    setProperty(name: string, value: string): void
    {
        this.propertyMap.set(name, value);
    }

    getProperty(name: string): string
    {
        if (!this.propertyMap.has(name))
        {
            throw new Error(`A property with ${name} does not exist`);
        }

        return this.propertyMap.get(name);
    }

    hasProperty(name: string): boolean
    {
        return this.propertyMap.has(name);
    }

    // Default implementation
    canBeParent()
    {
        return false;
    }

    toString()
    {
        return this.employee.name;
    }
}

class OrgPlannerChartManagerVertex extends OrgPlannerChartEmployeeVertex
{
    constructor(manager: Manager)
    {
        super(manager)
    }

    canBeParent()
    {
        return true;
    }

    getVertexType(): VertexType
    {
        return VertexType.MANAGER;
    }
}

class OrgPlannerChartICVertex extends OrgPlannerChartEmployeeVertex
{
    constructor(ic: IndividualContributor)
    {
        super(ic);
    }

    canBeParent()
    {
        return false;
    }

    getVertexType(): VertexType
    {
        return VertexType.IC;
    }
}

class OrgPlannerChartTeamVertex implements OrgPlannerChartVertex
{
    readonly orgEntity: Team;

    constructor(orgEntity: Team)
    {
        this.orgEntity = orgEntity;
    }

    get team()
    {
        return this.orgEntity;
    }

    toString()
    {
        return this.team.title;
    }

    getVertexType(): VertexType
    {
        return VertexType.TEAM;
    }
}

/*class OrgPlannerChartEdgeVerifier
{
    check(graph, edge, source, target, sourceOut, targetIn)
    {
        var checkPassed = true;

        checkPassed = target.getValue().canBeParent();

        return checkPassed ? null : 'Invalid Parent';
    }
}*/
export {
    OrgPlannerChartManagerVertex,
    OrgPlannerChartICVertex,
    OrgPlannerChartEmployeeVertex,
    OrgPlannerChartTeamVertex,
    // OrgPlannerChartEdgeVerifier,
    OrgPlannerChartModel,
    VertexType
};
export type{OrgPlannerChartVertex};
