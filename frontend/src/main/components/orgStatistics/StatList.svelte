<script lang="ts">
    import Datatable from "../ui/datatable/datatable.svelte";
    import type {
        ColumnDefinition,
        TableDataSource,
    } from "../ui/datatable/datatable";

    interface StatListProps {
        columnDefinitions: ColumnDefinition[];
        rowData: TableDataSource;
    }

    let { columnDefinitions, rowData }: StatListProps = $props();
</script>

<Datatable {columnDefinitions} {rowData}></Datatable>
