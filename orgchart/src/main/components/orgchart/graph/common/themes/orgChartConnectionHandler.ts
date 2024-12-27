import {Cell, ConnectionHandler, Graph, InternalMouseEvent} from "@maxgraph/core";
import {DropEntityOnEntityMouseEvent} from "@src/components/orgchart/OrgChartEvents";
import {PubSubManager} from "orgplanner-common/jscore";

class OrgChartConnectionHandler extends ConnectionHandler
{
    constructor(graph: Graph)
    {
        super(graph);
    }

    connect(source: Cell|null, target: Cell|null, evt: MouseEvent, dropTarget?: Cell|null): void
    {
        if (source != null && target != null)
        {
            const sourceEntity = source.getValue().orgEntity;
            const targetEntity = target.getValue().orgEntity;
            const dropMouseEvent = new DropEntityOnEntityMouseEvent(sourceEntity, targetEntity);
            PubSubManager.instance.fireEvent(dropMouseEvent);
        }
    }
}
export {OrgChartConnectionHandler};