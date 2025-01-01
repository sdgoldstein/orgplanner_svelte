<script lang="ts">
    import type { TeamStatistics } from "orgplanner-common/model";

    import StatList from "./StatList.svelte";
    import {
        TeamStatListTableDataSource,
        TeamStatListConstants,
    } from "./teamStatList";
    import type { TableDataSource } from "../ui/datatable/datatable";

    interface OrgStatListProps {
        teamStatistics: TeamStatistics;
    }

    let { teamStatistics }: OrgStatListProps = $props();

    const teamStatisticsTableDataSource: TableDataSource = $derived(
        new TeamStatListTableDataSource(teamStatistics),
    );
</script>

<StatList
    columnDefinitions={TeamStatListConstants.COLUMN_DEFINITIONS}
    rowData={teamStatisticsTableDataSource}
/>
