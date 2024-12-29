import {ServiceManager} from "@sphyrna/service-manager-ts";
import {OrgChartMaxGraphThemeDefault} from "@src/components/orgchart/graph/common/themes/orgChartMaxGraphThemeDefault";
import {EditableOrgChartMaxGraph} from "@src/components/orgchart/graph/editable/editbleOrgChartMaxGraph";
import {OrgChartEntityVisibleStateImpl} from "@src/components/orgchart/orgChartViewState";
import type {OrgPlannerImportService} from "@src/services/import/orgPlannerImportService";
import {OrgPlannerAppServicesConstants} from "@src/services/orgPlannerAppServicesConstants";

class ShowMockOrgChartApp
{
    init(): void {}

    getMockOrgList(): Array<string>
    {
        return [];
    }

    renderChart(): void {}
}

export {ShowMockOrgChartApp};

// Function to populate the select element
// @ts-ignore
function populateSelect()
{
    const selectElement = document.getElementById("mock_org_list");

    if (!selectElement)
    {
        console.error("Select element with id \"mock_org_list\" not found.");
        return;
    }

    fetch("generated_orgs/mock_org_list.txt")
        .then(response => response.text())
        .then(text => text.split("\n"))
        .then(lines => {
            lines.forEach(line => {
                const option = document.createElement("option");
                option.value = line.trim(); // Use trim() to remove any leading/trailing whitespace
                option.textContent = line.trim();
                selectElement.appendChild(option);
            });
        })
        .catch(error => console.error("Error populating select:", error));
}

// @ts-ignore
function renderOrgChart()
{
    const chartElementRoot = document.getElementById("mock_org_chart_div");
    if (chartElementRoot === null)
    {
        throw new Error("Could not find org chart div element")
    }

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const mockOrgTree = urlParams.get("mockOrg");
    if (!mockOrgTree)
    {
        throw new Error("Mock org query param not provided");
    }

    const mockOrgTreeURL = `generated_orgs/${mockOrgTree}.json`;
    fetch(mockOrgTreeURL).then((response) => response.json()).then((orgJSON) => {
        const orgPlannerImportService =
            ServiceManager.getService(OrgPlannerAppServicesConstants.ORG_PLANNER_IMPORT_SERVICE) as
            OrgPlannerImportService;
        const orgPlanner = orgPlannerImportService.importSync(orgJSON);

        const orgChartTheme = new OrgChartMaxGraphThemeDefault(orgPlanner.settings.colorTheme);
        const orgStructure = orgPlanner.orgSnapshots!.orgDataCore.orgStructure;
        const visibiltyState = new OrgChartEntityVisibleStateImpl(orgPlanner.settings.employeePropertyDescriptors);
        const currentGraph =
            new EditableOrgChartMaxGraph(chartElementRoot, orgStructure, orgChartTheme, visibiltyState);

        currentGraph.renderGraph();
    });
}