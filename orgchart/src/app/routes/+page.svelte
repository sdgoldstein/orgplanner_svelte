<script lang="ts">
    import {
        OrgEntityColorThemes,
        type OrgStructure,
        type OrgEntityPropertyDescriptor,
        type OrgDataCore,
        EmployeeReservedPropertyDescriptors,
    } from "orgplanner-common/model";

    import type { PageData } from "./$types";
    import { Form, Label, Select, SelectOption } from "@sphyrna/uicomponents";
    import OrgChart from "@src/components/orgchart/OrgChart.svelte";
    import { OrgChartMode } from "@src/components/orgchart/orgChartViewState";
    import { ServiceManager } from "@sphyrna/service-manager-ts";
    import {
        SERIALIZATION_SERVICE_NAME,
        SerializationFormat,
        type SerializationService,
    } from "orgplanner-common/jscore";

    let { data }: { data: PageData } = $props();

    let selectedOrg = $state({
        value: data.orgList[0],
        label: data.orgList[0],
    });
    let orgStructure: OrgStructure | undefined = $state();
    let mode: OrgChartMode = $state(OrgChartMode.PLANNING);
    let colorTheme = OrgEntityColorThemes.DEEP_BLUE_THEME;
    let propertyDescriptors = new Set<OrgEntityPropertyDescriptor>([
        EmployeeReservedPropertyDescriptors.PHONE,
        EmployeeReservedPropertyDescriptors.LOCATION,
    ]);

    function loadSelectedOrg(selected: {
        disabled: boolean;
        label: string;
        value: string;
    }): void {
        fetch(selected.value)
            .then((response) => response.text())
            .then((orgJSON) => {
                const serializationService =
                    ServiceManager.getService<SerializationService>(
                        SERIALIZATION_SERVICE_NAME,
                    );

                const orgDataCore =
                    serializationService.deserialize<OrgDataCore>(
                        orgJSON,
                        SerializationFormat.JSON,
                    );

                orgStructure = orgDataCore.orgStructure;
            });
    }

    $effect(() => {
        loadSelectedOrg({ ...selectedOrg, disabled: false });
    });
</script>

<Form id="orglist_form">
    <Label for="orglist_input_id">Org</Label>
    <Select
        id="orglist_input_id"
        name="orglist_input_name"
        placeholder="Select an Org"
        bind:selected={selectedOrg}
        onSelectedChange={loadSelectedOrg}
    >
        {#each data.orgList as nextOrg: String}
            <SelectOption value={nextOrg}>{nextOrg}</SelectOption>
        {/each}
    </Select>
</Form>

{#if orgStructure}
    <OrgChart {orgStructure} {mode} {colorTheme} {propertyDescriptors} />
{/if}
