import {OrgChartMode} from "../../orgChartViewState";
import {EditableOrgChartProxy} from "../mode/editable/editableOrgChartProxy";
import {PrintableOrgChartProxy} from "../mode/printable/printableOrgChartProxy";
import {ReadOnlyOrgChartProxy} from "../mode/readonly/readonlyOrgChartProxy";
import type {OrgChartProxy} from "./orgChartProxy";

class OrgChartProxyFactory
{
    private static _singletonInstance: OrgChartProxyFactory;

    private constructor() {}

    public static get instance(): OrgChartProxyFactory
    {
        if (!OrgChartProxyFactory._singletonInstance)
        {
            OrgChartProxyFactory._singletonInstance = new OrgChartProxyFactory();
        }
        return OrgChartProxyFactory._singletonInstance;
    }

    public getOrgChartProxy(mode: OrgChartMode): OrgChartProxy
    {
        let proxyToReturn: OrgChartProxy;

        switch (mode)
        {
        case OrgChartMode.EDIT:
            proxyToReturn = new EditableOrgChartProxy();
            break;
        case OrgChartMode.PRINT:
            proxyToReturn = new PrintableOrgChartProxy();
            break;
        case OrgChartMode.READ_ONLY:
            proxyToReturn = new ReadOnlyOrgChartProxy();
            break;
        default:
            throw new Error(`Unsupported mode: ${mode}`);
        }

        return proxyToReturn;
    }
}

export default OrgChartProxyFactory;