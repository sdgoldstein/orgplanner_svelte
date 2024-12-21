<script lang="ts">
    import {
        OrgEntityColorThemes,
        type OrgStructure,
        type OrgEntityPropertyDescriptor,
        type OrgDataCore,
        EmployeeReservedPropertyDescriptors,
    } from "orgplanner-common/model";

    import type { PageData } from "./$types";
    import {
        Button,
        Checkbox,
        Form,
        Label,
        RadioGroup,
        RadioGroupOption,
        Select,
        SelectOption,
    } from "@sphyrna/uicomponents";
    import OrgChart from "@src/components/orgchart/OrgChart.svelte";
    import { OrgChartMode } from "@src/components/orgchart/orgChartViewState";
    import { ServiceManager } from "@sphyrna/service-manager-ts";
    import {
        SERIALIZATION_SERVICE_NAME,
        SerializationFormat,
        type SerializationService,
    } from "orgplanner-common/jscore";
    import { ChevronLeft, ChevronRight } from "lucide-svelte";

    let { data }: { data: PageData } = $props();

    let selectedOrg = $state({
        value: 0,
        label: data.orgList[0],
    });
    let mode = $state(OrgChartMode.EDIT);
    let colorThemeName: string = $state(
        OrgEntityColorThemes.DEEP_BLUE_THEME.name,
    );
    let orgStructure: OrgStructure | undefined = $state();

    let propertyDescriptors = new Set<OrgEntityPropertyDescriptor>([
        EmployeeReservedPropertyDescriptors.PHONE,
        EmployeeReservedPropertyDescriptors.LOCATION,
    ]);

    function loadNextOrg() {
        const newIndex =
            selectedOrg.value < data.orgList.length - 1
                ? selectedOrg.value + 1
                : 0;
        selectedOrg = { value: newIndex, label: data.orgList[newIndex] };
    }
    function loadPreviousOrg() {
        const newIndex =
            selectedOrg.value > 0
                ? selectedOrg.value - 1
                : data.orgList.length - 1;
        selectedOrg = { value: newIndex, label: data.orgList[newIndex] };
    }

    function loadSelectedOrg(selected: {
        disabled: boolean;
        label: string;
        value: number;
    }): void {
        fetch(data.orgList[selected.value])
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
    <div class="flex p-2">
        <Label for="orgChartMode_input_id">Mode</Label>
        <RadioGroup
            id="orgChartMode_input_id"
            name="orgChartMode_input_name"
            bind:value={mode}
        >
            <RadioGroupOption value={OrgChartMode.EDIT}>Edit</RadioGroupOption>
            <RadioGroupOption value={OrgChartMode.READ_ONLY}
                >Read Only</RadioGroupOption
            >

            <RadioGroupOption value={OrgChartMode.PRINT}>Print</RadioGroupOption
            >
        </RadioGroup>
        <Label for="colorTheme_input_id">Mode</Label>
        <RadioGroup
            id="colorTheme_input_id"
            name="colorTheme_input_name"
            bind:value={colorThemeName}
        >
            <RadioGroupOption value={OrgEntityColorThemes.DEEP_BLUE_THEME.name}
                >{OrgEntityColorThemes.DEEP_BLUE_THEME.label}</RadioGroupOption
            >
            <RadioGroupOption value={OrgEntityColorThemes.DEEP_RED_THEME.name}
                >{OrgEntityColorThemes.DEEP_RED_THEME.label}</RadioGroupOption
            >
            <RadioGroupOption value={OrgEntityColorThemes.DEEP_GREEN_THEME.name}
                >{OrgEntityColorThemes.DEEP_GREEN_THEME.label}</RadioGroupOption
            >
        </RadioGroup>
        <Checkbox onclick={() => alert("clicked")}>Show/Hide Teams</Checkbox>
        <Checkbox onclick={() => alert("clicked")}>Show/Hide Managers</Checkbox>
        <Checkbox onclick={() => alert("clicked")}>Show/Hide ICs</Checkbox>
        <Checkbox onclick={() => alert("clicked")}
            >Show/Hide Team Property</Checkbox
        >
        {#each propertyDescriptors as nextPropertyDescriptor: OrgEntityPropertyDescriptor}
            <Checkbox onclick={() => alert("clicked")}
                >Show/Hide {nextPropertyDescriptor.title}</Checkbox
            >
        {/each}
        <Checkbox onclick={() => alert("clicked")}
            >Add/Remove Phone Property</Checkbox
        >
    </div>
    <div class="flex">
        <Button onclick={loadPreviousOrg}><ChevronLeft /></Button>
        <Select
            id="orglist_input_id"
            name="orglist_input_name"
            bind:selected={selectedOrg}
            onSelectedChange={loadSelectedOrg}
        >
            {#each data.orgList as nextOrg: String, index}
                <SelectOption value={index}>{nextOrg}</SelectOption>
            {/each}
        </Select>
        <Button onclick={loadNextOrg}><ChevronRight /></Button>
    </div>
</Form>

{#if orgStructure}
    <OrgChart
        {orgStructure}
        {mode}
        colorTheme={OrgEntityColorThemes.getColorThemeByName(colorThemeName)}
        {propertyDescriptors}
    />
{/if}
