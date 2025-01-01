<script lang="ts">
    import type { ICStatistics } from "orgplanner-common/model";

    import StatList from "./StatList.svelte";
    import {
        ICStatListTableDataSource,
        ICStatListConstants,
    } from "./icStatList";
    import type { TableDataSource } from "../ui/datatable/datatable";

    interface OrgStatListProps {
        icStatistics: ICStatistics;
    }

    let { icStatistics }: OrgStatListProps = $props();

    const icStatisticsTableDataSource: TableDataSource = $derived(
        new ICStatListTableDataSource(icStatistics),
    );
</script>

<StatList
    columnDefinitions={ICStatListConstants.COLUMN_DEFINITIONS}
    rowData={icStatisticsTableDataSource}
/>
