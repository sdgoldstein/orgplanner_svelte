<script lang="ts">
    import type { ManagerStatistics } from "orgplanner-common/model";

    import StatList from "./StatList.svelte";
    import {
        ManagerStatListTableDataSource,
        ManagerStatListConstants,
    } from "./managerStatList";
    import type { TableDataSource } from "../ui/datatable/datatable";

    interface OrgStatListProps {
        managerStatistics: ManagerStatistics;
    }

    let { managerStatistics }: OrgStatListProps = $props();

    const managerStatisticsTableDataSource: TableDataSource = $derived(
        new ManagerStatListTableDataSource(managerStatistics),
    );
</script>

<StatList
    columnDefinitions={ManagerStatListConstants.COLUMN_DEFINITIONS}
    rowData={managerStatisticsTableDataSource}
/>
