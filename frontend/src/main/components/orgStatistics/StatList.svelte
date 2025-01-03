<script lang="ts">
    import { Datatable } from "@sphyrna/uicomponents";
    import type {
        ColumnDefinition,
        TableDataSource,
    } from "@sphyrna/uicomponents";

    interface StatListProps {
        columnDefinitions: ColumnDefinition[];
        rowData: TableDataSource;
    }

    let { columnDefinitions, rowData }: StatListProps = $props();
</script>

<Datatable {columnDefinitions} {rowData}></Datatable>
