<script lang="ts">
    import { Pane, Splitpanes } from "svelte-splitpanes";
    import OrgChartPane from "@src/components/orgchart/OrgChartPane.svelte";
    import {
        PubSubManager,
        type PubSubEvent,
        type PubSubListener,
    } from "orgplanner-common/jscore";

    import type { Employee, Team } from "orgplanner-common/model";
    import {
        OrgPageEvents,
        EditEmployeeActionEvent,
        DeleteEmployeeEvent,
        DeleteEmployeeActionEvent,
        EditTeamActionEvent,
    } from "./orgPageEvents";
    import {
        DefaultOrgPageMediator,
        type OrgPageMediator,
    } from "./orgPageMediator";
    import ModifySettingsModal from "../orgchart/modal/ModifySettingsModal.svelte";
    import NewEditEmployeeModal, {
        type NewEditEmployeeModalMode,
        NewEditEmployeeModalModes,
    } from "../orgchart/modal/NewEditEmployeeModal.svelte";
    import { PrintableOrgChartProxy } from "orgplanner-orgchart";
    import NewEditTeamModal from "../orgchart/modal/NewEditTeamModal.svelte";
    import {
        RecordModalModes,
        type RecordModalMode,
    } from "../orgchart/modal/modal";
    import { OrgChartEditingToolbarEvents } from "../orgchart/toolbar/OrgChartEditingToolbar.svelte";

    let { appDynamicColorTheme, orgStructure, settings } = $props();

    /**
     * Set up the Org Page Mediator
     */
    let orgPageMediator: OrgPageMediator | undefined;
    $effect(() => {
        orgPageMediator = new DefaultOrgPageMediator(orgStructure);
        orgPageMediator.init();

        return () => {
            if (!orgPageMediator) {
                throw new Error("OrgPageMediator undefined in dismount");
            }
            orgPageMediator.reset();
        };
    });
    /**
     * End Set up the Org Page Mediator
     */

    /**
     * NewEdit Employee Modal Logic
     */
    let newEditEmployeeModalOpen: boolean = $state(false);
    let newEditEmployeeModalMode: NewEditEmployeeModalMode = $state(
        NewEditEmployeeModalModes.NEW,
    );
    let newEmployeeManagerId: string = $state("");
    let employeeToEdit: Employee | undefined = $state(undefined);

    class NewEditModalController implements PubSubListener {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            if (
                eventName ===
                OrgChartEditingToolbarEvents.ADD_EMPLOYEE_TOOLBAR_ACTION
            ) {
                if (!orgPageMediator) {
                    throw new Error("OrgPageMediator undefined");
                }
                newEmployeeManagerId =
                    orgPageMediator.getFirstSelectedManager().id;
                employeeToEdit = undefined;
                newEditEmployeeModalMode = NewEditEmployeeModalModes.NEW;
            } else if (eventName === OrgPageEvents.EDIT_EMPLOYEE_ACTION) {
                const editEmployeeActionEvent =
                    eventToHandle as EditEmployeeActionEvent;
                employeeToEdit = editEmployeeActionEvent.employeeToEdit;
                newEditEmployeeModalMode = NewEditEmployeeModalModes.EDIT;
            }

            newEditEmployeeModalOpen = true;
        }
    }
    const orgPageListener = new NewEditModalController();
    PubSubManager.instance.registerListener(
        OrgChartEditingToolbarEvents.ADD_EMPLOYEE_TOOLBAR_ACTION,
        orgPageListener,
    );
    PubSubManager.instance.registerListener(
        OrgPageEvents.EDIT_EMPLOYEE_ACTION,
        orgPageListener,
    );
    /**
     * End NewEdit Employee Modal Logic
     */

    /*
     * NewEdit Team Modal Logic
     */
    let newEditTeamModalOpen: boolean = $state(false);
    let newEditTeamModalMode: RecordModalMode = $state(RecordModalModes.NEW);
    let newTeamManagerId: string = $state("");
    let teamToEdit: Team | undefined = $state(undefined);
    class NewEditTeamModalController implements PubSubListener {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            if (
                eventName ===
                OrgChartEditingToolbarEvents.ADD_TEAM_TOOLBAR_ACTION
            ) {
                if (!orgPageMediator) {
                    throw new Error("OrgPageMediator undefined");
                }
                newEmployeeManagerId =
                    orgPageMediator.getFirstSelectedManager().id;
                teamToEdit = undefined;
                newEditTeamModalMode = RecordModalModes.NEW;
            } else if (eventName === OrgPageEvents.EDIT_TEAM_ACTION) {
                const editTeamActionEvent =
                    eventToHandle as EditTeamActionEvent;
                teamToEdit = editTeamActionEvent.teamToEdit;
                newEditTeamModalMode = NewEditEmployeeModalModes.EDIT;
            }

            newEditTeamModalOpen = true;
        }
    }
    const newEditTeamActionListener = new NewEditTeamModalController();
    PubSubManager.instance.registerListener(
        OrgChartEditingToolbarEvents.ADD_TEAM_TOOLBAR_ACTION,
        newEditTeamActionListener,
    );
    PubSubManager.instance.registerListener(
        OrgPageEvents.EDIT_TEAM_ACTION,
        newEditTeamActionListener,
    );

    /**
     * End NewEdit Team Modal Logic
     */

    /**
     * Delete Employee Modal Logic
     */
    class DeleteDialogController implements PubSubListener {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            // NOT MODAL at the moment.  Need to add at some point
            let employeeToDelete;
            if (
                eventName ===
                OrgChartEditingToolbarEvents.DELETE_EMPLOYEE_TOOLBAR_ACTION
            ) {
                if (!orgPageMediator) {
                    throw new Error("OrgPageMediator undefined");
                }
                employeeToDelete = orgPageMediator.getFirstSelectedEmployee();
            } else if (eventName === OrgPageEvents.DELETE_EMPLOYEE_ACTION) {
                const deleteEmployeeActionEvent =
                    eventToHandle as DeleteEmployeeActionEvent;
                employeeToDelete = deleteEmployeeActionEvent.employeeToDelete;
            }

            if (!employeeToDelete) {
                throw new Error("Could not obtain employee to delete");
            }
            const deleteEmployeeEvent = new DeleteEmployeeEvent(
                employeeToDelete,
            );
            PubSubManager.instance.fireEvent(deleteEmployeeEvent);
        }
    }
    const deleteActionListener = new DeleteDialogController();
    PubSubManager.instance.registerListener(
        OrgPageEvents.DELETE_EMPLOYEE_ACTION,
        deleteActionListener,
    );
    PubSubManager.instance.registerListener(
        OrgChartEditingToolbarEvents.DELETE_EMPLOYEE_TOOLBAR_ACTION,
        deleteActionListener,
    );
    /**
     * End Delete Employee Modal Logic
     */

    /**
     * ModifySettings Employee Modal Logic
     */
    let modifySettingsModalOpen: boolean = $state(false);
    class ModifySettingsModalController implements PubSubListener {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            if (
                eventName ===
                OrgChartEditingToolbarEvents.MODIFY_SETTINGS_TOOLBAR_ACTION
            ) {
                modifySettingsModalOpen = true;
            }
        }
    }
    const modifySettingsListener = new ModifySettingsModalController();
    PubSubManager.instance.registerListener(
        OrgChartEditingToolbarEvents.MODIFY_SETTINGS_TOOLBAR_ACTION,
        modifySettingsListener,
    );
    /**
     * End ModifySettings Employee Modal Logic
     */

    /**
     * Save As Image Logic
     */
    let saveAsImageChartContainer: HTMLElement | undefined;
    class SaveAsImageController implements PubSubListener {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            if (!saveAsImageChartContainer) {
                throw new Error("saveAsImageChartContainer undefined in mount");
            }
            // FIXME - Could we avoid accessing tghe proxy directly and intead create a component here?
            const printableOrgChart = new PrintableOrgChartProxy(
                saveAsImageChartContainer,
                orgStructure,
                settings.colorTheme,
                settings.employeePropertyDescriptors,
            );
            const a = document.createElement("a");
            const file = new Blob([saveAsImageChartContainer.innerHTML], {
                type: "image/svg+xml",
            });
            a.href = URL.createObjectURL(file);
            a.download = "orgPlan.svg";
            a.click();
        }
    }
    const saveAsImageListener = new SaveAsImageController();
    PubSubManager.instance.registerListener(
        OrgChartEditingToolbarEvents.SAVE_AS_IMAGE_TOOLBAR_ACTION,
        saveAsImageListener,
    );
    /**
     * End Save As Image Logic
     */
</script>

<div class="h-screen flex">
    <Splitpanes theme="org-chart-splitter-theme">
        <Pane class="p-2">
            <OrgChartPane {appDynamicColorTheme} {orgStructure} {settings} />
        </Pane>
        <!--    <Pane size="0" class="p-2">dlfjsdlf</Pane>  -->
    </Splitpanes>
</div>

<div
    id="save-as-image-chart-container"
    class="invisible"
    bind:this={saveAsImageChartContainer}
></div>

<NewEditEmployeeModal
    bind:open={newEditEmployeeModalOpen}
    bind:mode={newEditEmployeeModalMode}
    bind:managerId={newEmployeeManagerId}
    bind:employeeToEdit
    {appDynamicColorTheme}
    {orgStructure}
/>

<ModifySettingsModal
    bind:open={modifySettingsModalOpen}
    {appDynamicColorTheme}
    orgPlannerSettings={settings}
/>

<NewEditTeamModal
    bind:open={newEditTeamModalOpen}
    bind:mode={newEditTeamModalMode}
    bind:managerId={newTeamManagerId}
    bind:teamToEdit
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
