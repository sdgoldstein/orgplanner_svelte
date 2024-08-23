<script lang="ts">
    import OrgChart from "@src/components/orgchart/OrgChart.svelte";
    import OrgChartEditingToolbar from "@src/components/orgchart/toolbar/OrgChartEditingToolbar.svelte";
    import { OrgChartMode } from "@src/components/orgchart/orgChartViewState";
    import { type OrgPlannerColorThemableComponentProps } from "@src/components/theme.js";
    import NewEmployeeModal from "@src/components/orgchart/modal/NewEmployeeModal.svelte";
    import type { OrgStructure } from "orgplanner-common/model";
    import type { OrgPlannerSettings } from "@src/model/orgPlanner";
    import {
        PubSubManager,
        type PubSubEvent,
        type PubSubListener,
    } from "orgplanner-common/jscore";
    import { OrgPlannerAppEvents } from "../app/orgPlannerAppEvents";
    import { onMount } from "svelte";

    interface OrgChartPaneProps extends OrgPlannerColorThemableComponentProps {
        orgStructure: OrgStructure;
        settings: OrgPlannerSettings;
    }

    class OrgChartPanePubSubListener implements PubSubListener {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            if (eventName === OrgPlannerAppEvents.SHOW_ADD_EMPLOYEE_MODAL) {
                newEmployeeModalOpen = true;
            }
        }
    }

    onMount(() => {
        const orgChartPanePubSubListener = new OrgChartPanePubSubListener();
        PubSubManager.instance.registerListener(
            OrgPlannerAppEvents.SHOW_ADD_EMPLOYEE_MODAL,
            orgChartPanePubSubListener,
        );
    });

    let { orgStructure, settings, appDynamicColorTheme }: OrgChartPaneProps =
        $props();
    let newEmployeeModalOpen = $state(false);
</script>

<OrgChartEditingToolbar {appDynamicColorTheme} {orgStructure}
></OrgChartEditingToolbar>
<OrgChart
    data-id="org_chart"
    {orgStructure}
    mode={OrgChartMode.PLANNING}
    colorTheme={settings.colorTheme}
    propertyDescriptors={settings.employeePropertyDescriptors}
/>

<NewEmployeeModal
    bind:open={newEmployeeModalOpen}
    {appDynamicColorTheme}
    {orgStructure}
/>
