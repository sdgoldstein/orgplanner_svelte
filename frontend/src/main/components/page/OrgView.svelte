<script lang="ts">
    import { Pane, Splitpanes } from "svelte-splitpanes";
    import OrgChartPane from "@src/components/orgchart/OrgChartPane.svelte";
    import {
        DefaultOrgViewMediator,
        EditEmployeeActionEvent,
        OrgViewEvents,
        type OrgViewMediator,
    } from "./orgViewMediator";
    import {
        PubSubManager,
        type PubSubEvent,
        type PubSubListener,
    } from "orgplanner-common/jscore";

    import { OrgPlannerAppEvents } from "../app/orgPlannerAppEvents";
    import NewEmployeeModal from "../orgchart/modal/NewEmployeeModal.svelte";

    let { appDynamicColorTheme, orgStructure, settings } = $props();

    let orgViewMediator: OrgViewMediator | undefined;
    $effect(() => {
        orgViewMediator = new DefaultOrgViewMediator(orgStructure);
        orgViewMediator.init();

        return () => {
            if (!orgViewMediator) {
                throw new Error("orgViewMediator undefined in dismount");
            }
            orgViewMediator.reset();
        };
    });

    let newEmployeeModalOpen: boolean = $state(false);
    let newEmployeeManagerId: string = $state("");

    class OrgViewListener implements PubSubListener {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            if (eventName === OrgPlannerAppEvents.ADD_EMPLOYEE_TOOLBAR_ACTION) {
                if (!orgViewMediator) {
                    throw new Error("orgViewMediator undefined");
                }
                newEmployeeManagerId =
                    orgViewMediator.getFirstSelectedManager().id;
                newEmployeeModalOpen = true;
            } else if ((eventName = OrgViewEvents.EDIT_EMPLOYEE_ACTION)) {
                const editEmployeeActionEvent =
                    eventToHandle as EditEmployeeActionEvent;
                newEmployeeManagerId =
                    editEmployeeActionEvent.employeeToEdit.managerId;
                newEmployeeModalOpen = true;
            }
        }
    }
    const orgViewListener = new OrgViewListener();
    PubSubManager.instance.registerListener(
        OrgPlannerAppEvents.ADD_EMPLOYEE_TOOLBAR_ACTION,
        orgViewListener,
    );
    PubSubManager.instance.registerListener(
        OrgViewEvents.EDIT_EMPLOYEE_ACTION,
        orgViewListener,
    );
</script>

<div class="h-screen flex">
    <Splitpanes theme="org-chart-splitter-theme">
        <Pane class="p-2">
            <OrgChartPane {appDynamicColorTheme} {orgStructure} {settings} />
        </Pane>
        <!--    <Pane size="0" class="p-2">dlfjsdlf</Pane>  -->
    </Splitpanes>
</div>

<NewEmployeeModal
    bind:open={newEmployeeModalOpen}
    bind:managerId={newEmployeeManagerId}
    {appDynamicColorTheme}
    {orgStructure}
/>

<style>
    :global(.org-chart-splitter-theme) {
        background-color: white;
    }

    :global(.org-chart-splitter-theme .splitpanes__pane) {
        background-color: white;
    }

    :global(.org-chart-splitter-theme .splitpanes__splitter) {
        background-color: #ccc;
        box-sizing: border-box;
        position: relative;
        flex-shrink: 0;
    }
    :global(
            .org-chart-splitter-theme .splitpanes__splitter:before,
            .org-chart-splitter-theme .splitpanes__splitter:after
        ) {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        background-color: rgba(0, 0, 0, 0.15);
        transition: background-color 0.3s;
    }
    :global(
            .org-chart-splitter-theme .splitpanes__splitter:hover:before,
            .org-chart-splitter-theme .splitpanes__splitter:hover:after
        ) {
        background-color: rgba(0, 0, 0, 0.25);
    }
    :global(.org-chart-splitter-theme .splitpanes__splitter:first-child) {
        cursor: auto;
    }

    :global(
            .org-chart-splitter-theme.splitpanes
                .splitpanes
                .splitpanes__splitter
        ) {
        z-index: 1;
    }
    :global(
            .org-chart-splitter-theme.splitpanes--vertical
                > .splitpanes__splitter,
            .org-chart-splitter-theme
                .splitpanes--vertical
                > .splitpanes__splitter
        ) {
        width: 4px;
        cursor: col-resize;
    }
    :global(
            .org-chart-splitter-theme.splitpanes--vertical
                > .splitpanes__splitter:before,
            .org-chart-splitter-theme.splitpanes--vertical
                > .splitpanes__splitter:after,
            .org-chart-splitter-theme
                .splitpanes--vertical
                > .splitpanes__splitter:before,
            .org-chart-splitter-theme
                .splitpanes--vertical
                > .splitpanes__splitter:after
        ) {
        transform: translateY(-50%);
        width: 1px;
        height: 30px;
    }
    :global(
            .org-chart-splitter-theme.splitpanes--vertical
                > .splitpanes__splitter:before,
            .org-chart-splitter-theme
                .splitpanes--vertical
                > .splitpanes__splitter:before
        ) {
        margin-left: -2px;
    }
    :global(
            .org-chart-splitter-theme.splitpanes--vertical
                > .splitpanes__splitter:after,
            .org-chart-splitter-theme
                .splitpanes--vertical
                > .splitpanes__splitter:after
        ) {
        margin-left: 1px;
    }
</style>
