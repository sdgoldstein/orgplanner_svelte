import type {OrgChartProps} from "../../../orgChart";

interface OrgChartProxy
{
    onMount(chartContainer: HTMLElement): void;
    onDismount(): void;
    onUpdate(orgChartProps: OrgChartProps): void;
}

export type{OrgChartProxy};