<script lang="ts">
    import type { OrgSummaryStatistics } from "orgplanner-common/model";

    import StatList from "./StatList.svelte";
    import {
        OrgSummaryStatListTableDataSource,
        OrgSummaryStatListConstants,
    } from "./orgSummaryStatList";
    import type { TableDataSource } from "../ui/datatable/datatable";

    interface OrgStatListProps {
        orgSummaryStatistics: OrgSummaryStatistics;
    }

    let { orgSummaryStatistics }: OrgStatListProps = $props();

    const orgSummaryStatisticsTableDataSource: TableDataSource = $derived(
        new OrgSummaryStatListTableDataSource(orgSummaryStatistics),
    );
</script>

<StatList
    columnDefinitions={OrgSummaryStatListConstants.COLUMN_DEFINITIONS}
    rowData={orgSummaryStatisticsTableDataSource}
/>
