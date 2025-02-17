import {ServiceManager} from "@sphyrna/service-manager-ts";
import * as fs from "fs";

import {
    TreeBasedOrgStructure,
    type OrgTemplate,
    SimpleOrgTemplate,
    type OrgDataCore,
    OrgDataCoreDefaultImpl,
    EmployeeReservedPropertyDescriptors,
    TeamConstants,
    type OrgEntityPropertyDescriptor
} from "orgplanner-common/model";
import {SerializationFormat, SERIALIZATION_SERVICE_NAME, type SerializationService} from "orgplanner-common/jscore";

const DEFAULT_EMPLOYEE_PROPERTY_DESCRIPTORS: Set<OrgEntityPropertyDescriptor> = new Set<OrgEntityPropertyDescriptor>(
    [ EmployeeReservedPropertyDescriptors.PHONE, EmployeeReservedPropertyDescriptors.LOCATION ]);

interface OrgTreeLevel
{
    managers: number;
    ics: number;
    teams: number;
}

interface OrgTreeDescriptor
{
    name: string;
    levels: OrgTreeLevel[]
}

class OrgTreeGenerator
{
    static readonly ID_LENGTH = 5;
    static readonly TITLE_LENGTH = 10;
    static readonly OTHER_LENGTH = 6;

    async generationEdgeTestOrgTree(outputFile: string): Promise<void>
    {
        // Create Org Structure Object
        const generatedOrgTree: TreeBasedOrgStructure = this._createStarterOrgTree();

        const rootTeamId = generatedOrgTree.rootTeam.id;
        const orgLeaderManagerId = generatedOrgTree.orgLeader.id;

        // IC, Manager, and Team Combos
        // Add one team and on ic to create simple tree
        const teamId = this.addRandomTeam(generatedOrgTree, orgLeaderManagerId);
        this.addRandomEmployee(generatedOrgTree, orgLeaderManagerId, teamId, false);

        // Add an IC that is managed by the root manager but points ot the root team
        this.addRandomEmployee(generatedOrgTree, orgLeaderManagerId, rootTeamId, false);

        // Manager, Manager, Team combos
        // Add a manager that reports the root manager and is on a team that the manager manages
        const anotherTeamId = this.addRandomTeam(generatedOrgTree, orgLeaderManagerId);
        this.addRandomEmployee(generatedOrgTree, orgLeaderManagerId, anotherTeamId, true);

        // Add a manager that reports to the root manager but points ot the root tea
        this.addRandomEmployee(generatedOrgTree, orgLeaderManagerId, rootTeamId, true);

        this._writeToOutputFile(generatedOrgTree, outputFile);
    }

    async generateOrgTree(outputFile: string, orgTreeConfig: OrgTreeDescriptor): Promise<void>
    {
        // Create Org Structure Object
        const generatedOrgTree: TreeBasedOrgStructure = this._createStarterOrgTree();

        // Build each level according to descriptor
        const levelIterator: IterableIterator<OrgTreeLevel> = orgTreeConfig.levels.values();
        this.buildNextLevel(generatedOrgTree, levelIterator, [ generatedOrgTree.orgLeader.id ]);

        this._writeToOutputFile(generatedOrgTree, outputFile);
    }

    private _writeToOutputFile(generatedOrgTree: TreeBasedOrgStructure, outputFile: string)
    {
        const newOrgCoreData: OrgDataCore = new OrgDataCoreDefaultImpl(generatedOrgTree);

        // Finally, export to a file
        const serializationSevice: SerializationService =
            ServiceManager.getService<SerializationService>(SERIALIZATION_SERVICE_NAME);

        const jsonOut = serializationSevice.serialize(newOrgCoreData, SerializationFormat.JSON);
        fs.writeFileSync(outputFile, jsonOut);
    }

    private _createStarterOrgTree()
    {
        const newOrgStrTreeBasedOrgStructure: TreeBasedOrgStructure =
            new TreeBasedOrgStructure(DEFAULT_EMPLOYEE_PROPERTY_DESCRIPTORS);

        // Create Top Level Manager
        const orgTemplate: OrgTemplate = new SimpleOrgTemplate();
        orgTemplate.apply(newOrgStrTreeBasedOrgStructure);

        return newOrgStrTreeBasedOrgStructure;
    }

    buildNextLevel(generatedOrgStructure: TreeBasedOrgStructure, levelIterator: IterableIterator<OrgTreeLevel>,
                   previousLevelManagerIds: string[]): void
    {
        const nextLevelResult: IteratorResult<OrgTreeLevel> = levelIterator.next();
        if (nextLevelResult && ((nextLevelResult.done === false) || (nextLevelResult.value)))
        {
            const nextLevel: OrgTreeLevel = nextLevelResult.value;
            const numManagers = previousLevelManagerIds.length;

            const managerIdToTeamIdMap: Map<string, string[]> = new Map<string, string[]>();
            for (let i = 0; i < nextLevel.teams; i++)
            {
                const managerId = previousLevelManagerIds[i % numManagers];
                const newTeamId: string = this.addRandomTeam(generatedOrgStructure, managerId);
                let teamIdsArray = managerIdToTeamIdMap.get(managerId);
                if (teamIdsArray === undefined)
                {
                    teamIdsArray = [ newTeamId ];
                    managerIdToTeamIdMap.set(managerId, teamIdsArray);
                }
                else
                {
                    teamIdsArray.push(newTeamId);
                }
            }

            for (let i = 0; i < nextLevel.ics; i++)
            {
                const managerId = previousLevelManagerIds[i % numManagers];
                const teamIdsForManager = managerIdToTeamIdMap.get(managerId);
                const teamId = ((teamIdsForManager !== undefined) && (teamIdsForManager.length > 0))
                                   ? teamIdsForManager[i % teamIdsForManager.length]
                                   : TeamConstants.NO_TEAM_ID;

                this.addRandomEmployee(generatedOrgStructure, managerId, teamId, false);
            }

            const nextManagerIds: string[] = [];
            for (let i = 0; i < nextLevel.managers; i++)
            {
                const managerId = previousLevelManagerIds[i % numManagers];
                const teamIdsForManager = managerIdToTeamIdMap.get(managerId);
                const teamId = ((teamIdsForManager !== undefined) && (teamIdsForManager.length > 0))
                                   ? teamIdsForManager[i % teamIdsForManager.length]
                                   : TeamConstants.NO_TEAM_ID;
                const newManagerId: string = this.addRandomEmployee(generatedOrgStructure, managerId, teamId, true);
                nextManagerIds.push(newManagerId);
            }

            this.buildNextLevel(generatedOrgStructure, levelIterator, nextManagerIds);
        }
    }

    addRandomEmployee(newOrgStructure: TreeBasedOrgStructure, managerId: string, teamId: string,
                      isManager: boolean): string
    {
        const id = this.randomString(OrgTreeGenerator.ID_LENGTH);
        const name =
            this.randomString(OrgTreeGenerator.OTHER_LENGTH) + " " + this.randomString(OrgTreeGenerator.OTHER_LENGTH);
        const title = this.randomString(OrgTreeGenerator.TITLE_LENGTH);
        const mobilePhone = "999-999-9999";
        const workCity = this.randomChoice<string>([ "San Francisco, CA", "Austin, TX", "New York, NY" ]);

        const properties = new Map([
            [ EmployeeReservedPropertyDescriptors.PHONE.name, mobilePhone ],
            [ EmployeeReservedPropertyDescriptors.LOCATION.name, workCity ]
        ]);

        const employeeAdded = newOrgStructure.importEmployee(id, name, title, managerId, teamId, isManager, properties);
        return employeeAdded.id;
    }

    addRandomTeam(newOrgStructure: TreeBasedOrgStructure, managerId: string): string
    {
        const id = this.randomString(OrgTreeGenerator.ID_LENGTH);
        const name = this.randomString(OrgTreeGenerator.TITLE_LENGTH);
        const teamAdded = newOrgStructure.importTeam(id, name, managerId);

        return teamAdded.id;
    }

    randomString(length: number): string
    {
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++)
        {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    randomLetter(): string
    {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        return letters[Math.floor(Math.random() * letters.length)];
    }

    randomNumber(max: number): number
    {
        return Math.floor(Math.random() * max);
    }

    randomChoice<T>(choices: T[]): T
    {
        return choices[Math.floor(Math.random() * choices.length)];
    }
}

export {OrgTreeGenerator};
export type{OrgTreeDescriptor, OrgTreeLevel};
