
import type {OrgChartProps} from "@src/components/orgchart/orgChart";
import type {OrgChartProxy} from "../base/orgChartProxy";

abstract class OrgChartProxyBase implements OrgChartProxy
{
    private _chartContainer: HTMLElement|undefined;

    protected get chartContainer(): HTMLElement
    {
        if (this._chartContainer === undefined)
        {
            throw new Error("Chart container not set");
        }

        return this._chartContainer;
    }

    onMount(chartContainer: HTMLElement): void
    {
        this._chartContainer = chartContainer;
    }

    onDismount(): void
    {
        this._chartContainer = undefined;
    }

    abstract onUpdate(orgChartProps: OrgChartProps): void;
}

export {OrgChartProxyBase};
