<script lang="ts">
    import type { OrgPlannerSettings } from "@src/model/orgPlanner";
    import { getAppDynamicColorTheme } from "@src/components/theme.js";
    import OrgPage from "@src/components/page/OrgPage.svelte";
    import { OrgPlannerAppEvents } from "@src/components/app/orgPlannerAppEvents";
    import {
        type PubSubListener,
        type PubSubEvent,
        PubSubManager,
    } from "orgplanner-common/jscore";

    let { data } = $props();

    let orgSettings = $state(getSettings());
    let appDynamicColorTheme = $derived(
        getAppDynamicColorTheme(orgSettings.colorTheme),
    );

    let orgStructure = $derived(
        data.orgPlanner.planningProject.orgPlan.orgDataCore.orgStructure,
    );

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
