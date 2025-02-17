<script lang="ts">
    import type {
        OrgPlannerManager,
        OrgPlannerSettings,
    } from "@src/model/orgPlanner";
    import { getAppDynamicColorTheme } from "@src/components/theme.js";
    import OrgPage from "@src/components/page/OrgPage.svelte";
    import { OrgPlannerAppEvents } from "@src/components/app/orgPlannerAppEvents";
    import {
        type PubSubListener,
        type PubSubEvent,
        PubSubManager,
        SERIALIZATION_SERVICE_NAME,
        SerializationFormat,
        type SerializationService,
    } from "orgplanner-common/jscore";
    import { OrgPlannerAppServicesConstants } from "@src/services/orgPlannerAppServicesConstants.js";
    import { ServiceManager } from "@sphyrna/service-manager-ts";

    let { data } = $props();

    let orgSettings = $state(getSettings());
    let appDynamicColorTheme = $derived(
        getAppDynamicColorTheme(orgSettings.colorTheme),
    );

    let orgStructure = $derived(
        data.orgPlanner.rootPlanningProject.orgPlan.orgDataCore.orgStructure,
    );
    $effect(() => {
        // This will be recreated whenever `milliseconds` changes
        const interval = setInterval(() => {
            const orgPlannerManager =
                ServiceManager.getService<OrgPlannerManager>(
                    OrgPlannerAppServicesConstants.ORG_PLANNER_MANAGER_SERVICE,
                );
            orgPlannerManager.storeOrgPlanner(data.orgPlanner);
        }, 1000);

        return () => {
            // if a callback is provided, it will run
            // a) immediately before the effect re-runs
            // b) when the component is destroyed
            clearInterval(interval);
        };
    });

    class SettingsChangesController implements PubSubListener {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            if (eventName === OrgPlannerAppEvents.SETTINGS_CHANGED) {
                orgSettings = getSettings();
            }
        }
    }

    const settingsChangedController = new SettingsChangesController();
    PubSubManager.instance.registerListener(
        OrgPlannerAppEvents.SETTINGS_CHANGED,
        settingsChangedController,
    );

    function getSettings(): OrgPlannerSettings {
        return data.orgPlanner.settings;
    }

    /**
     * Export Plan Logic - This may need to move someday
     */
    class ExportPlanController implements PubSubListener {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            const serializationSevice: SerializationService =
                ServiceManager.getService<SerializationService>(
                    SERIALIZATION_SERVICE_NAME,
                );

            const jsonOutput = serializationSevice.serialize(
                data.orgPlanner,
                SerializationFormat.JSON,
            );

            const a = document.createElement("a");
            const file = new Blob([jsonOutput], { type: "text/plain" });
            a.href = URL.createObjectURL(file);
            a.download = "orgPlan.json";
            a.click();
        }
    }
    const exportPlanListener = new ExportPlanController();
    PubSubManager.instance.registerListener(
        OrgPlannerAppEvents.EXPORT_PLAN,
        exportPlanListener,
    );
    /**
     * EndExport Plan Logic
     */
</script>

<OrgPage {appDynamicColorTheme} {orgStructure} settings={orgSettings} />
