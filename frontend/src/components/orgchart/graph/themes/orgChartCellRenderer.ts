import {Cell, CellRenderer, CellState} from "@maxgraph/core";

import type {OrgChartEntityVisibleState} from "../../orgChartViewState";
import {
    OrgPlannerChartEmployeeVertex,
    OrgPlannerChartTeamVertex,
    type OrgPlannerChartVertex
} from "../orgPlannerChartModel";

class OrgChartCellRenderer extends CellRenderer
{
    private _viewState: OrgChartEntityVisibleState;

    constructor(viewState: OrgChartEntityVisibleState)
    {
        super();
        this._viewState = viewState;
    }

    /**
     * Returns the value to be used for the label.
     *
     * @param state <CellState> for which the label should be created.
     */
    getLabelValue(state: CellState): string
    {
        let valueToReturn = "";

        const cell: Cell = state.cell;

        if (cell.isVertex())
        {
            const cellValue = cell.value as OrgPlannerChartVertex;
            if (cellValue instanceof OrgPlannerChartEmployeeVertex)
            {
                const employee = cellValue.employee;
                valueToReturn += `<div>${employee.title}</div>`;

                for (const nextProperty of employee.propertyIterator())
                {
                    if (this._viewState.isVisible(nextProperty[0]))
                    {
                        valueToReturn += `<div>${nextProperty[1]}</div>`;
                    }
                }

                valueToReturn += `<div><i>${employee.team.title}</i></div>`;
            }
            else if (cellValue instanceof OrgPlannerChartTeamVertex)
            {
                const team = cellValue.team;
                valueToReturn = team.title;
            }
        }

        return valueToReturn;
    }
}

export {OrgChartCellRenderer};