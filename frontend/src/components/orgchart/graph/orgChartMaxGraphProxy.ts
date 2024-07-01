

import type {Employee, OrgEntity, OrgEntityColorTheme, OrgStructure} from "orgplanner-common/model";

import type {OrgChartEntityVisibleState} from "../orgChartViewState";

import {OrgChartMaxGraph} from "./orgChartMaxGraph";
import {OrgChartMaxGraphThemeBase} from "./themes/orgChartMaxGraphThemeBase";

interface OrgChartMaxGraphProxy
{
    orgStructure: OrgStructure;
    visibilityState: OrgChartEntityVisibleState;
    colorTheme: OrgEntityColorTheme;
    isReadOnly: boolean;

    isEntitySelected(): boolean
    getSelectedEntity(): OrgEntity
    render(): Promise<void>;
    batchUpdate(updateFunction: () => void): void;
    addEmployee(newEmployee: any): unknown;
    destroy(): void;
}

class OrgChartMaxGraphProxyImpl implements OrgChartMaxGraphProxy
{
    private _graph: OrgChartMaxGraph;

    private _element: HTMLElement;
    private _orgStructure: OrgStructure;
    private _visibilityState: OrgChartEntityVisibleState;
    private _isReadOnly: boolean;
    private _colorTheme: OrgEntityColorTheme;

    constructor(element: HTMLElement, orgStructure: OrgStructure, colorTheme: OrgEntityColorTheme,
                visibilityState: OrgChartEntityVisibleState, isReadOnly: boolean)
    {
        this._element = element;
        this._orgStructure = orgStructure;
        this._colorTheme = colorTheme;
        this._visibilityState = visibilityState;
        this._isReadOnly = isReadOnly;

        this._graph = new OrgChartMaxGraph(this._element, this.orgStructure,
                                           new OrgChartMaxGraphThemeBase(this.colorTheme), this.visibilityState);
    }

    get orgStructure(): OrgStructure
    {
        return this._orgStructure;
    }

    set orgStructure(orgStructureToSet: OrgStructure)
    {
        this._orgStructure = orgStructureToSet;
    }

    get visibilityState(): OrgChartEntityVisibleState
    {
        return this._visibilityState;
    }

    set visibilityState(visibiltyStateToSet: OrgChartEntityVisibleState)
    {
        this._visibilityState = visibiltyStateToSet;
    }

    get colorTheme(): OrgEntityColorTheme
    {
        return this._colorTheme;
    }

    set colorTheme(colorThemeToSet: OrgEntityColorTheme)
    {
        this._colorTheme = colorThemeToSet;

        this._graph.graphTheme = new OrgChartMaxGraphThemeBase(this.colorTheme)
    }

    get isReadOnly(): boolean
    {
        return this._isReadOnly;
    }

    set isReadOnly(valueToSet: boolean)
    {
        this._isReadOnly = valueToSet;
    }

    batchUpdate(updateFunction: () => void): void
    {
        this._graph.batchUpdate(() => { updateFunction(); });
    }

    async render(): Promise<void>
    {
        return new Promise<void>((accept, reject) => {
            this._graph.renderGraph();
            accept();
        });
    }

    async addEmployee(newEmployee: Employee): Promise<void>
    {
        return new Promise<void>((accept, reject) => {
            this._graph.addEmployee(newEmployee);
            accept();
        });
    }

    destroy(): void
    {
        this._graph.destroy();
    }

    getSelectedEntity(): OrgEntity
    {
        return this._graph.getSelectedEntity();
    }

    isEntitySelected(): boolean
    {
        return this._graph.isEntitySelected();
    }
}

export {OrgChartMaxGraphProxyImpl};
export type {OrgChartMaxGraphProxy};
