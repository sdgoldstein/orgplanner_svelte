import {OrgPlannerAppServices} from "@src/services/orgPlannerAppServices";
import * as fs from "fs";
import * as path from "path";
import {fileURLToPath} from "url";
import {type OrgTreeDescriptor, OrgTreeGenerator} from "./OrgTreeGenerator";

interface MockOrgConfig
{
    mockOrganizations: OrgTreeDescriptor[];
}

function generateOrgsRecursive(currentInputDir: string, currentOutputDir: string): string[]
{
    const valueToReturn: string[] = [];

    const pathContents: fs.Dirent[] = fs.readdirSync(currentInputDir, {withFileTypes : true});
    for (const nextEntry of pathContents)
    {
        const nextEntryName = nextEntry.name;
        if (nextEntry.isDirectory())
        {
            const newInputDir = path.join(currentInputDir, nextEntryName)
            const newOutputDir = path.join(currentOutputDir, nextEntryName);

            if (!fs.existsSync(newOutputDir))
            {
                fs.mkdirSync(newOutputDir);
            }

            const valuesToAdd: string[] = generateOrgsRecursive(newInputDir, newOutputDir);
            valueToReturn.push(...valuesToAdd);
        }
        else
        {
            // assume it's a mock org description
            const mockOrgsJSON: string =
                fs.readFileSync(path.join(currentInputDir, nextEntryName), {encoding : "utf8"});

            const orgTreeConfig: MockOrgConfig = JSON.parse(mockOrgsJSON) as MockOrgConfig;

            for (const nextMockOrg of orgTreeConfig.mockOrganizations)
            {
                const outputFile = path.join(currentOutputDir, nextMockOrg.name + ".json");
                const orgGenerator: OrgTreeGenerator = new OrgTreeGenerator();
                orgGenerator.generateOrgTree(outputFile, nextMockOrg)
                    .catch((err: Error) => { console.log("Error:" + err.message + "/n" + err.stack); });
                valueToReturn.push(outputFile);
            }
        }
    }

    return valueToReturn;
}

// Run the program
OrgPlannerAppServices.initServices();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const generatedDir = path.join(__dirname, "generated_orgs");
if (!fs.existsSync(generatedDir))
{
    fs.mkdirSync(generatedDir);
}

const mockOrgFilesWrittern = generateOrgsRecursive(path.join(__dirname, "org_descriptors"), generatedDir);
const relativeMockFiles =
    mockOrgFilesWrittern.map((nextFileName) => { return path.relative(generatedDir, nextFileName); })
const mockOrgListFile = fs.openSync(path.join(generatedDir, "mock_org_list.txt"), "w");
fs.writeSync(mockOrgListFile, relativeMockFiles.join("\n"));
