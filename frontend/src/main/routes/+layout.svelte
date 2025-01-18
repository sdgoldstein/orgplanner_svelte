<script lang="ts">
    import { ServiceManager } from "@sphyrna/service-manager-ts";
    import {
        ChangeSettingsActionEvent,
        CreateNewOrgEvent,
        ImportPlanEvent,
        OrgPlannerAppEvents,
        SettingsChangedEvent,
    } from "@src/components/app/orgPlannerAppEvents";
    import "@src/app/app.css";

    import OrgPlannerAppHeader from "@src/components/app/appheader/OrgPlannerAppHeader.svelte";
    import PageHeader from "@src/components/page/header/PageHeader.svelte";
    import { getAppDynamicColorTheme } from "@src/components/theme";
    import type { OrgPlanner, OrgPlannerManager } from "@src/model/orgPlanner";
    import { OrgPlannerAppServicesConstants } from "@src/services/orgPlannerAppServicesConstants";
    import {
        PubSubManager,
        SERIALIZATION_SERVICE_NAME,
        SerializationFormat,
    } from "orgplanner-common/jscore";
    import type {
        PubSubEvent,
        PubSubListener,
        SerializationService,
    } from "orgplanner-common/jscore";
    import type { Snippet } from "svelte";
    import type { LayoutData } from "./$types";
    import { invalidateAll } from "$app/navigation";

    let { data, children }: { data: LayoutData; children: Snippet } = $props();

    let appDynamicColorTheme = $state(
        getAppDynamicColorTheme(data.orgPlanner.settings.colorTheme),
    );

    // Is this the best place for this?  Not sure.  And, does it work?  Not Sure
    const pubSubManager = PubSubManager.instance;
    pubSubManager.registerListener(OrgPlannerAppEvents.CREATE_NEW_ORG, {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            const createOrgEvent = eventToHandle as CreateNewOrgEvent;
            const orgName = createOrgEvent.orgName;

            const orgPlannerManager =
                ServiceManager.getService<OrgPlannerManager>(
                    OrgPlannerAppServicesConstants.ORG_PLANNER_MANAGER_SERVICE,
                ) as OrgPlannerManager;

            const orgPlanner =
                orgPlannerManager.createOrgPlannerWithTitle(orgName);
            orgPlannerManager.storeOrgPlanner(orgPlanner);
            invalidateAll();
        },
    });

    pubSubManager.registerListener(OrgPlannerAppEvents.IMPORT_PLAN, {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            const importOrgEvent = eventToHandle as ImportPlanEvent;

            const orgPlannerManager =
                ServiceManager.getService<OrgPlannerManager>(
                    OrgPlannerAppServicesConstants.ORG_PLANNER_MANAGER_SERVICE,
                ) as OrgPlannerManager;
            const serializationSevice: SerializationService =
                ServiceManager.getService<SerializationService>(
                    SERIALIZATION_SERVICE_NAME,
                );

            const orgPlanner = serializationSevice.deserialize<OrgPlanner>(
                importOrgEvent.jsonToImport,
                SerializationFormat.JSON,
            );

            orgPlannerManager.storeOrgPlanner(orgPlanner);
            invalidateAll();
        },
    });

    class ChangeSettingsController implements PubSubListener {
        onEvent(eventName: string, eventToHandle: PubSubEvent): void {
            if (eventName === OrgPlannerAppEvents.CHANGE_SETTINGS_ACTION) {
                data.orgPlanner.settings = (
                    eventToHandle as ChangeSettingsActionEvent
                ).newSettings;

                // We need to set the color theme directive because objects aren't deeply reactive
                appDynamicColorTheme = getAppDynamicColorTheme(
                    data.orgPlanner.settings.colorTheme,
                );

                PubSubManager.instance.fireEvent(new SettingsChangedEvent());
            }
        }
    }

    const changeSettingsController = new ChangeSettingsController();
    PubSubManager.instance.registerListener(
        OrgPlannerAppEvents.CHANGE_SETTINGS_ACTION,
        changeSettingsController,
    );
</script>

<OrgPlannerAppHeader {appDynamicColorTheme}></OrgPlannerAppHeader>
<PageHeader></PageHeader>

{@render children()}
