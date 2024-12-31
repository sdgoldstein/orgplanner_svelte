<script lang="ts">
    import {
        AccordionPanel,
        AccordionPanelItem,
        AccordionPanelItemHeader,
        AccordionPanelItemContent,
    } from "@sphyrna/uicomponents";
    import {
        AppDynamicColorThemeColorSelector,
        tempgetDynamicColorTheme,
        type OrgPlannerColorThemableComponentProps,
    } from "@src/components/theme.js";
    import type { OrgStructure } from "orgplanner-common/model";
    import type { OrgPlannerSettings } from "@src/model/orgPlanner";
    import OrgStatList from "./OrgStatList.svelte";
    import ManagerStatList from "./ManagerStatList.svelte";
    import TeamStatList from "./TeamStatList.svelte";
    import ICStatList from "./ICStatList.svelte";

    interface OrgStatisticsPanelProps
        extends OrgPlannerColorThemableComponentProps {
        orgStructure: OrgStructure;
        settings: OrgPlannerSettings;
    }

    let {
        orgStructure,
        settings,
        appDynamicColorTheme,
    }: OrgStatisticsPanelProps = $props();
    const dynamicColorThemeMap = $derived(
        tempgetDynamicColorTheme(appDynamicColorTheme),
    );
    const colorVariant = AppDynamicColorThemeColorSelector.SECONDARY.toString();
</script>

<div>
    <AccordionPanel>
        <AccordionPanelItem>
            <AccordionPanelItemHeader
                dynamicColorTheme={dynamicColorThemeMap}
                {colorVariant}>Organization Statistics</AccordionPanelItemHeader
            >
            <AccordionPanelItemContent>
                <OrgStatList
                    orgStatistics={orgStructure.orgStatistics
                        .orgSummaryStatistics}
                />
            </AccordionPanelItemContent>
        </AccordionPanelItem>
        <div style="padding:.20em"></div>
        <AccordionPanelItem>
            <AccordionPanelItemHeader
                dynamicColorTheme={dynamicColorThemeMap}
                {colorVariant}>Manager Statistics</AccordionPanelItemHeader
            >
            <AccordionPanelItemContent>
                <ManagerStatList
                    managerStatistics={orgStructure.orgStatistics
                        .managerStatistics}
                ></ManagerStatList>
            </AccordionPanelItemContent>
        </AccordionPanelItem>
        <div style="padding:.20em"></div>
        <AccordionPanelItem>
            <AccordionPanelItemHeader
                dynamicColorTheme={dynamicColorThemeMap}
                {colorVariant}>TeamTemp Statistics</AccordionPanelItemHeader
            >
            <AccordionPanelItemContent>
                <TeamStatList
                    teamStatistics={orgStructure.orgStatistics.teamStatistics}
                ></TeamStatList>
            </AccordionPanelItemContent>
        </AccordionPanelItem>
        <div style="padding:.20em"></div>
        <AccordionPanelItem>
            <AccordionPanelItemHeader
                dynamicColorTheme={dynamicColorThemeMap}
                {colorVariant}>IC Statistics</AccordionPanelItemHeader
            >
            <AccordionPanelItemContent>
                <ICStatList
                    icStatistics={orgStructure.orgStatistics.icStatistics}
                ></ICStatList>
            </AccordionPanelItemContent>
        </AccordionPanelItem>
    </AccordionPanel>
</div>
