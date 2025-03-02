<script lang="ts">
    import {
        OrgEntityColorThemes,
        type OrgStructure,
        type OrgEntityPropertyDescriptor,
        type OrgDataCore,
        EmployeeReservedPropertyDescriptors,
        OrgEntityTypes,
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
        type SelectValue,
    } from "@sphyrna/uicomponents";
    import OrgChart from "@src/components/orgchart/OrgChart.svelte";
    import {
        FixedOrgEntityPropertyDescriptors,
        type ViewToggableEntity,
    } from "@src/components/orgchart/graph/common/core/orgChartViewState";
    import { ViewToggableEntityToggledEvent } from "@src/components/orgchart/OrgChartEvents";
    import { ServiceManager } from "@sphyrna/service-manager-ts";
    import {
        PubSubManager,
        SERIALIZATION_SERVICE_NAME,
        SerializationFormat,
        type PubSubEvent,
        type PubSubListener,
        type SerializationService,
    } from "orgplanner-common/jscore";
    import { ChevronLeft, ChevronRight } from "lucide-svelte";
    import { OrgChartEvents } from "@src/components/orgchart/OrgChartEvents";
    import { OrgChartMode } from "@src/components/orgchart/orgChart";

    let { data }: { data: PageData } = $props();

    let selectedOrg: number = $state(0);

    let mode = $state(
        data.modeParam != null
            ? OrgChartMode[data.modeParam as keyof typeof OrgChartMode]
            : OrgChartMode.EDIT,
    );
    let colorThemeName: string = $state(
        OrgEntityColorThemes.DEEP_BLUE_THEME.name,
    );
    let colorVariant = "primary";
    let dynamicColorTheme = $derived.by(() => {
        let managerColorAssignment = OrgEntityColorThemes.getColorThemeByName(
            colorThemeName,
        ).getColorAssignment(OrgEntityTypes.MANAGER);
        return {
            colorThemes: new Map([
                [
                    "primary",
                    {
                        coreColor: managerColorAssignment.primary,
                        textColor: managerColorAssignment.textOnPrimary,
                    },
                ],
            ]),
        };
    });

    let orgStructure: OrgStructure | undefined = $state();

    let propertyDescriptors = $derived.by(() => {
        let valueToReturn = undefined;
        if (orgStructure !== undefined) {
            valueToReturn = new Set<OrgEntityPropertyDescriptor>([
                ...orgStructure.employeePropertyIterator(),
            ]);
        } else {
            valueToReturn = new Set<OrgEntityPropertyDescriptor>();
        }

        return valueToReturn;
    });

    function toggleVisibility(entity: ViewToggableEntity, isVisibile: boolean) {
        const visibilityChangeEvent = new ViewToggableEntityToggledEvent(
            entity,
            isVisibile,
        );
        PubSubManager.instance.fireEvent(visibilityChangeEvent);
    }

    function onModeChange(newMode: string) {
        // goto does not seem to change state
        //goto(`?mode=${newMode}`, { replaceState: true, invalidateAll: true });
        const currentUrl = window.location.href.split("?")[0];
        const newUrl = `${currentUrl}?mode=${newMode}`;
        window.location.href = newUrl;
    }

    function loadNextOrg() {
        selectedOrg =
            selectedOrg < data.orgList.length - 1 ? selectedOrg + 1 : 0;
    }
    function loadPreviousOrg() {
        selectedOrg =
            selectedOrg > 0 ? selectedOrg - 1 : data.orgList.length - 1;
    }

    function loadSelectedOrg(selected: SelectValue): void {
        fetch(data.orgList[selected as number])
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
        loadSelectedOrg(selectedOrg);
    });

    class TestListener implements PubSubListener {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            //alert(`Event ${eventName} received`);
        }
    }
    const testListener = new TestListener();
    PubSubManager.instance.registerListener(
        OrgChartEvents.DELETE_EMPLOYEE_CELL_ACTION,
        testListener,
    );
    PubSubManager.instance.registerListener(
        OrgChartEvents.EDIT_EMPLOYEE_CELL_ACTION,
        testListener,
    );
    PubSubManager.instance.registerListener(
        OrgChartEvents.ORG_CHART_SELECTION_CHANGED_EVENT,
        testListener,
    );
    PubSubManager.instance.registerListener(
        OrgChartEvents.DROP_ENTITY_ON_ENTITY_MOUSE_EVENT,
        testListener,
    );
</script>

<Form id="orglist_form">
    <div class="flex p-2">
        <Label for="orgChartMode_input_id">Mode</Label>
        <RadioGroup
            id="orgChartMode_input_id"
            name="orgChartMode_input_name"
            bind:value={mode}
            onValueChange={onModeChange}
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
        <Checkbox
            id="teamVisibilityCheckbox_input_id"
            name="teamVisibilityCheckbox_name_id"
            {colorVariant}
            {dynamicColorTheme}
            onValueChange={(checked) => {
                toggleVisibility(OrgEntityTypes.TEAM, checked);
            }}>Show/Hide Teams</Checkbox
        >
        <Checkbox
            id="managerVisibilityCheckbox_input_id"
            name="managerVisibilityCheckbox_name_id"
            {colorVariant}
            {dynamicColorTheme}
            checked
            onValueChange={(checked) => {
                toggleVisibility(OrgEntityTypes.MANAGER, checked);
            }}>Show/Hide Managers</Checkbox
        >
        <Checkbox
            id="icVisibilityCheckbox_input_id"
            name="icVisibilityCheckbox_name_id"
            {colorVariant}
            {dynamicColorTheme}
            checked
            onValueChange={(checked) => {
                toggleVisibility(
                    OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR,
                    checked,
                );
            }}>Show/Hide ICs</Checkbox
        >
        <Checkbox
            id="titleVisibilityCheckbox_input_id"
            name="titleVisibilityCheckbox_name_id"
            {colorVariant}
            checked
            {dynamicColorTheme}
            onValueChange={(checked) => {
                toggleVisibility(
                    FixedOrgEntityPropertyDescriptors.TITLE,
                    checked,
                );
            }}>Show/Hide Title Property</Checkbox
        >
        <Checkbox
            id="teamPropertyVisibilityCheckbox_input_id"
            name="teamPropertyVisibilityCheckbox_name_id"
            {colorVariant}
            checked
            {dynamicColorTheme}
            onValueChange={(checked) => {
                toggleVisibility(
                    FixedOrgEntityPropertyDescriptors.TEAM_TITLE,
                    checked,
                );
            }}>Show/Hide Team Property</Checkbox
        >
        {#each propertyDescriptors as nextPropertyDescriptor: OrgEntityPropertyDescriptor}
            <Checkbox
                id={`${nextPropertyDescriptor.title}PropertyVisibilityCheckbox_input_id`}
                name={`${nextPropertyDescriptor.title}PropertyVisibilityCheckbox_name_id`}
                {colorVariant}
                {dynamicColorTheme}
                checked
                onValueChange={(checked) => {
                    toggleVisibility(nextPropertyDescriptor, checked);
                }}>Show/Hide {nextPropertyDescriptor.title}</Checkbox
            >
        {/each}
        <Checkbox
            id="phonePropertyVisibilityCheckbox_input_id"
            name="phonePropertyVisibilityCheckbox_name_id"
            {colorVariant}
            {dynamicColorTheme}
            checked
            onValueChange={(checked) => {
                // iterate through to find phone and disable it
                if (propertyDescriptors !== undefined) {
                    for (const nextPropertyDescriptor of propertyDescriptors) {
                        if (
                            nextPropertyDescriptor.name ==
                            EmployeeReservedPropertyDescriptors.PHONE.name
                        ) {
                            nextPropertyDescriptor.enabled = checked;
                        }
                    }
                }
            }}>Add/Remove Phone Property</Checkbox
        >
    </div>
    <div class="flex">
        <Button onclick={loadPreviousOrg}><ChevronLeft /></Button>
        <Select
            id="orglist_input_id"
            name="orglist_input_name"
            bind:value={selectedOrg}
            onValueChange={loadSelectedOrg}
        >
            {#each data.orgList as nextOrg: String, index}
                <SelectOption value={index} typeaheadIndex={nextOrg}
                    >{nextOrg}</SelectOption
                >
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
