<script lang="ts">
    import type { OrgPlannerManager, OrgPlannerSettings } from "@src/model/orgPlanner";
    import { getAppDynamicColorTheme } from "@src/components/theme.js";
    import OrgPage from "@src/components/page/OrgPage.svelte";
    import { OrgPlannerAppEvents } from "@src/components/app/orgPlannerAppEvents";
    import {
        type PubSubListener,
        type PubSubEvent,
        PubSubManager,
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
            const orgPlannerManager = ServiceManager.getService<OrgPlannerManager>(
                OrgPlannerAppServicesConstants.ORG_PLANNER_MANAGER_SERVICE);
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
</script>

<OrgPage {appDynamicColorTheme} {orgStructure} settings={orgSettings} />
