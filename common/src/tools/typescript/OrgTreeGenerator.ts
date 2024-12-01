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
import {
    SerializationFormat,
    SERIALIZATION_SERVICE_NAME,
    type SerializationService
} from "@src/jscore/serialization/serializationService";

const DEFAULT_EMPLOYEE_PROPERTY_DESCRIPTORS: Set<OrgEntityPropertyDescriptor> = new Set<OrgEntityPropertyDescriptor>(
    [ EmployeeReservedPropertyDescriptors.PHONE, EmployeeReservedPropertyDescriptors.LOCATION ]);

interface OrgTreeLevel
{
    managers: number;
    ics: number;
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

    async generateOrgTree(outputFile: string, orgTreeConfig: OrgTreeDescriptor): Promise<void>
    {
        // Create Org Structure Object
        const newOrgStrTreeBasedOrgStructure: TreeBasedOrgStructure =
            new TreeBasedOrgStructure(DEFAULT_EMPLOYEE_PROPERTY_DESCRIPTORS);

        // Create Top Level Manager
        const orgTemplate: OrgTemplate = new SimpleOrgTemplate();
        orgTemplate.apply(newOrgStrTreeBasedOrgStructure);
        const topManagerId: string = newOrgStrTreeBasedOrgStructure.orgLeader.id;

        // Build each level according to descriptor
        const levelIterator: IterableIterator<OrgTreeLevel> = orgTreeConfig.levels.values();
        this.buildNextLevel(newOrgStrTreeBasedOrgStructure, levelIterator, [ topManagerId ]);

        const newOrgCoreData: OrgDataCore =
            new OrgDataCoreDefaultImpl(this.randomString(this.randomNumber(25)), newOrgStrTreeBasedOrgStructure);

        // Finally, export to a file
        const serializationSevice: SerializationService =
            ServiceManager.getService<SerializationService>(SERIALIZATION_SERVICE_NAME);

        const jsonOut = serializationSevice.serialize(newOrgCoreData, SerializationFormat.JSON);
        fs.writeFileSync(outputFile, jsonOut);
    }

    buildNextLevel(newOrgStrTreeBasedOrgStructure: TreeBasedOrgStructure, levelIterator: IterableIterator<OrgTreeLevel>,
                   managerIds: string[]): void
    {
        const nextLevelResult: IteratorResult<OrgTreeLevel> = levelIterator.next();
        if (nextLevelResult && ((nextLevelResult.done === false) || (nextLevelResult.value)))
        {
            const nextLevel: OrgTreeLevel = nextLevelResult.value;
            const numManagers = managerIds.length;
            for (let i = 0; i < nextLevel.ics; i++)
            {
                const managerId = managerIds[i % numManagers];
                this.addRandomEmployee(newOrgStrTreeBasedOrgStructure, managerId, false);
            }

            const nextManagerIds: string[] = [];
            for (let i = 0; i < nextLevel.managers; i++)
            {
                const managerId = managerIds[i % numManagers];
                const newManagerId: string = this.addRandomEmployee(newOrgStrTreeBasedOrgStructure, managerId, true);
                nextManagerIds.push(newManagerId);
            }

            this.buildNextLevel(newOrgStrTreeBasedOrgStructure, levelIterator, nextManagerIds);
        }
    }

    addRandomEmployee(newOrgStructure: TreeBasedOrgStructure, managerId: string, isManager: boolean): string
    {
        const id = this.randomString(OrgTreeGenerator.ID_LENGTH);
        const name =
            this.randomString(OrgTreeGenerator.OTHER_LENGTH) + " " + this.randomString(OrgTreeGenerator.OTHER_LENGTH);
        const title = this.randomString(OrgTreeGenerator.TITLE_LENGTH);
        const teamId = TeamConstants.NO_TEAM_ID;
        const mobilePhone = "999-999-9999";
        const workCity = this.randomChoice<string>([ "San Francisco, CA", "Austin, TX", "New York, NY" ]);

        const properties = new Map([
            [ EmployeeReservedPropertyDescriptors.PHONE, mobilePhone ],
            [ EmployeeReservedPropertyDescriptors.LOCATION, workCity ]
        ]);

        const employeeAdded = newOrgStructure.importEmployee(id, name, title, managerId, teamId, isManager, properties);
        return employeeAdded.id;
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
