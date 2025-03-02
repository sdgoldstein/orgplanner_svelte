<script lang="ts">
    import {
        DeleteEmployeeCellActionEvent,
        DeleteTeamCellActionEvent,
        EditEmployeeCellActionEvent,
        EditTeamCellActionEvent,
        OrgChartEvents,
    } from "orgplanner-orgchart";
    import { Pane, Splitpanes } from "svelte-splitpanes";
    import OrgChartPanel from "@src/components/orgchart/OrgChartPanel.svelte";
    import {
        PubSubManager,
        type PubSubEvent,
        type PubSubListener,
    } from "orgplanner-common/jscore";

    import {
        type Employee,
        type Team,
        OrgEntityTypes,
    } from "orgplanner-common/model";
    import { DeleteEmployeeEvent, DeleteTeamEvent } from "./orgPageEvents";
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
    import OrgStatisticsPanel from "../orgStatistics/OrgStatisticsPanel.svelte";
    import { Button } from "@sphyrna/uicomponents";
    import OrgChartViewSettingsPanel from "../orgchart/viewsettings/OrgChartViewSettingsPanel.svelte";
    import { ChartColumn, ChevronLeft, ChevronRight, Eye } from "lucide-svelte";
    import CreateSnapshotModal from "../orgchart/modal/CreateSnapshotModal.svelte";

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
     * Splitter variables/logic
     */
    let rightStatPanelSize = $state(0);
    let rightViewSettingsPanelSize = $state(0);
    let rightPanelSize = $derived(
        rightStatPanelSize + rightViewSettingsPanelSize,
    );

    function isRightSplitterOpen() {
        return rightStatPanelSize !== 0 || rightViewSettingsPanelSize !== 0;
    }
    /**
     * End variables/logic
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
            } else if (eventName === OrgChartEvents.EDIT_EMPLOYEE_CELL_ACTION) {
                const editEmployeeActionEvent =
                    eventToHandle as EditEmployeeCellActionEvent;
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
        OrgChartEvents.EDIT_EMPLOYEE_CELL_ACTION,
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
                newTeamManagerId = orgPageMediator.getFirstSelectedManager().id;
                teamToEdit = undefined;
                newEditTeamModalMode = RecordModalModes.NEW;
            } else if (eventName === OrgChartEvents.EDIT_TEAM_CELL_ACTION) {
                const editTeamActionEvent =
                    eventToHandle as EditTeamCellActionEvent;
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
        OrgChartEvents.EDIT_TEAM_CELL_ACTION,
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
            if (
                eventName ===
                OrgChartEditingToolbarEvents.DELETE_ENTITY_TOOLBAR_ACTION
            ) {
                if (!orgPageMediator) {
                    throw new Error("OrgPageMediator undefined");
                }

                // FIXME - We should be able to delete multiple entities at once
                let entityToDelete = orgPageMediator.getFirstSelectedEntity();

                // FIXME - Button should be disabled if entity can't be deleted
                if (entityToDelete.canDelete()) {
                    if (entityToDelete.orgEntityType === OrgEntityTypes.TEAM) {
                        const deleteTeamEvent = new DeleteTeamEvent(
                            entityToDelete as Team,
                        );
                        PubSubManager.instance.fireEvent(deleteTeamEvent);
                    } else {
                        const deleteEmployeeEvent = new DeleteEmployeeEvent(
                            entityToDelete as Employee,
                        );
                        PubSubManager.instance.fireEvent(deleteEmployeeEvent);
                    }
                }
            } else if (
                eventName === OrgChartEvents.DELETE_EMPLOYEE_CELL_ACTION
            ) {
                const deleteEmployeeActionEvent =
                    eventToHandle as DeleteEmployeeCellActionEvent;
                let employeeToDelete =
                    deleteEmployeeActionEvent.employeeToDelete;
                const deleteEmployeeEvent = new DeleteEmployeeEvent(
                    employeeToDelete,
                );
                PubSubManager.instance.fireEvent(deleteEmployeeEvent);
            } else if (eventName === OrgChartEvents.DELETE_TEAM_CELL_ACTION) {
                const deleteTeamActionEvent =
                    eventToHandle as DeleteTeamCellActionEvent;
                let teamToDelete = deleteTeamActionEvent.teamToDelete;
                const deleteTeamEvent = new DeleteTeamEvent(teamToDelete);
                PubSubManager.instance.fireEvent(deleteTeamEvent);
            }
        }
    }
    const deleteActionListener = new DeleteDialogController();
    PubSubManager.instance.registerListener(
        OrgChartEvents.DELETE_EMPLOYEE_CELL_ACTION,
        deleteActionListener,
    );
    PubSubManager.instance.registerListener(
        OrgChartEvents.DELETE_TEAM_CELL_ACTION,
        deleteActionListener,
    );
    PubSubManager.instance.registerListener(
        OrgChartEditingToolbarEvents.DELETE_ENTITY_TOOLBAR_ACTION,
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
            const printableOrgChart = new PrintableOrgChartProxy();
            printableOrgChart.onMount(saveAsImageChartContainer);
            printableOrgChart.onUpdate({
                orgStructure,
                colorTheme: settings.colorTheme,
                employeePropertyDescriptors:
                    settings.employeePropertyDescriptors,
            });
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

    /**
     * Create Snapshot Logic
     */
    let createSnapshotModalOpen: boolean = $state(false);
    class CreateSnapshotController implements PubSubListener {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            if (
                eventName ===
                OrgChartEditingToolbarEvents.CREATE_SNAPSHOT_TOOLBAR_ACTION
            ) {
                createSnapshotModalOpen = true;
            }
        }
    }
    const createSnapshotListener = new CreateSnapshotController();
    PubSubManager.instance.registerListener(
        OrgChartEditingToolbarEvents.CREATE_SNAPSHOT_TOOLBAR_ACTION,
        createSnapshotListener,
    );
    /**
     * End Save As Image Logic
     */
</script>

<div class="h-screen flex">
    <Splitpanes theme="org-chart-splitter-theme" style="transition:none">
        <Pane>
            <div
                class="fixed z-50 flex flex-col mt-1 gap-y-0.5"
                style={`right: ${rightPanelSize}%`}
            >
                <div
                    class="flex justify-center rounded-l-md w-10 h-8 items-center"
                    style="background-color:{appDynamicColorTheme.secondary}"
                >
                    <Button
                        onclick={() => {
                            rightStatPanelSize =
                                rightStatPanelSize === 0 ? 30 : 0;
                            rightViewSettingsPanelSize = 0;
                        }}
                    >
                        <div class="flex flex-row items-center">
                            {#if !isRightSplitterOpen()}
                                <ChevronLeft
                                    fill={appDynamicColorTheme.textOnPrimary}
                                    class="w-5 h-5 -ml-1.5 -mr-1"
                                    strokeWidth="0"
                                    size="5"
                                />
                            {/if}
                            <ChartColumn
                                strokeWidth=".15rem"
                                color={appDynamicColorTheme.textOnPrimary}
                                class="w-5 h-5"
                            />
                            {#if rightStatPanelSize > 0}
                                <ChevronRight
                                    fill={appDynamicColorTheme.textOnPrimary}
                                    class="w-5 h-5 -ml-1 -mr-1.5"
                                    strokeWidth="0"
                                    size="5"
                                />
                            {/if}
                        </div>
                    </Button>
                </div>
                <div
                    class="flex justify-center rounded-l-md w-10 h-8 items-center"
                    style="background-color:{appDynamicColorTheme.secondary}"
                >
                    <Button
                        onclick={() => {
                            rightViewSettingsPanelSize =
                                rightViewSettingsPanelSize === 0 ? 30 : 0;
                            rightStatPanelSize = 0;
                        }}
                    >
                        <div class="flex flex-row items-center">
                            {#if !isRightSplitterOpen()}
                                <ChevronLeft
                                    fill={appDynamicColorTheme.textOnPrimary}
                                    class="w-5 h-5 -ml-1.5 -mr-1"
                                    strokeWidth="0"
                                    size="5"
                                />
                            {/if}
                            <Eye
                                strokeWidth=".15rem"
                                color={appDynamicColorTheme.textOnPrimary}
                                class="w-5 h-5"
                            />
                            {#if rightViewSettingsPanelSize > 0}
                                <ChevronRight
                                    fill={appDynamicColorTheme.textOnPrimary}
                                    class="w-5 h-5 -ml-1 -mr-1.5"
                                    strokeWidth="0"
                                    size="5"
                                />
                            {/if}
                        </div>
                    </Button>
                </div>
            </div>
            <OrgChartPanel {appDynamicColorTheme} {orgStructure} {settings} />
        </Pane>
        {#if rightStatPanelSize > 0}
            <Pane snapSize={8} bind:size={rightStatPanelSize}>
                <OrgStatisticsPanel
                    {orgStructure}
                    {settings}
                    {appDynamicColorTheme}
                />
            </Pane>
        {/if}
        {#if rightViewSettingsPanelSize > 0}
            <Pane snapSize={8} bind:size={rightViewSettingsPanelSize}>
                <OrgChartViewSettingsPanel {settings} {appDynamicColorTheme} />
            </Pane>
        {/if}
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
/>

<CreateSnapshotModal
    bind:open={createSnapshotModalOpen}
    {appDynamicColorTheme}
/>

<style>
    :global(.splitpanes--vertical) :global(.splitpanes__pane) {
        transition: width 0s ease-out !important;
    }
    :global(.splitpanes--vertical) > :global(.splitpanes__pane) {
        transition: width 0s ease-out !important;
    }

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
        height: 50px;
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
