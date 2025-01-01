<script lang="ts">
    import type { ColumnDefinition, TableDataSource } from "./datatable";

    interface DatatableProps {
        columnDefinitions: ColumnDefinition[];
        rowData: TableDataSource;
    }

    let { columnDefinitions, rowData }: DatatableProps = $props();
</script>

<table>
    <thead>
        <tr>
            {#each columnDefinitions as nextColumnDefinition}
                <th>{nextColumnDefinition.columnLabel}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each rowData as nextDataRow}
            <tr>
                {#each columnDefinitions as nextColumnDefinition}
                    <td
                        >{nextDataRow.getData(
                            nextColumnDefinition.columnName,
                        )}</td
                    >
                {/each}
            </tr>
        {/each}
    </tbody>
</table>
