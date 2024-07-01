import {type ColorHex, type OrgEntityColorTheme, OrgEntityTypes} from "orgplanner-common/model";
import {extendTailwindMerge} from 'tailwind-merge';

interface AppDynamicColorTheme
{
    primary: ColorHex;
    textOnPrimary: ColorHex;
    secondary: ColorHex;
    textOnSecondary: ColorHex;
}

enum AppDynamicColorThemeColorSelector {
    PRIMARY = "primary",
    SECONDARY = "secondary",
    NONE = "none"
}

interface OrgPlannerColorThemableComponentProps
{
    appDynamicColorTheme: AppDynamicColorTheme;
    colorSelector?: AppDynamicColorThemeColorSelector;
}

function getAppDynamicColorTheme(orgEntityColorTheme: OrgEntityColorTheme): AppDynamicColorTheme
{
    // Map the manager color to the primary color and IC to secondary
    const managerColorAssignment = orgEntityColorTheme.getColorAssignment(OrgEntityTypes.MANAGER);
    const icColorAssignment = orgEntityColorTheme.getColorAssignment(OrgEntityTypes.INDIVIDUAL_CONTRIBUTOR);
    return {
        primary : managerColorAssignment.primary,
        textOnPrimary : managerColorAssignment.textOnPrimary,
        secondary : icColorAssignment.primary,
        textOnSecondary : icColorAssignment.textOnPrimary
    };
}

function getDefaultStyle(appDynamicColorTheme: AppDynamicColorTheme,
                         colorSelector?: AppDynamicColorThemeColorSelector): string
{
    let bgColor;
    let color;
    switch (colorSelector)
    {
    case AppDynamicColorThemeColorSelector.PRIMARY:
        bgColor = appDynamicColorTheme.primary;
        color = appDynamicColorTheme.textOnPrimary;
        break;
    case AppDynamicColorThemeColorSelector.SECONDARY:
        bgColor = appDynamicColorTheme.secondary;
        color = appDynamicColorTheme.textOnSecondary;
        break;
    case AppDynamicColorThemeColorSelector.NONE:
        bgColor = "rgb(var(--color-surface-200))"
        color = "rgb(var(--text-on-surface))"
        break;
    default:
        // Default to primary
        bgColor = appDynamicColorTheme.primary;
        color = appDynamicColorTheme.textOnPrimary;
        break;
    }

    return `background-color:${bgColor} !important; color:${color} !important;`;
}

enum FixedThemeColor {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
    TERTIARY = 'tertiary',
    WARNING = 'warning',
    SUCCESS = 'success',
    ERROR = 'error',
}
function getFixedThemeColorByValue(themeColorValue: string): FixedThemeColor
{
    const valueToReturn: FixedThemeColor|undefined =
        Object.values(FixedThemeColor).find(value => value === themeColorValue);
    if (!valueToReturn)
    {
        throw new Error(`${themeColorValue} is not a value ThemeColor`);
    }

    return valueToReturn;
}

function getColorClassesForFixedThemeColor(themeColor: FixedThemeColor): string
{
    return `bg-${themeColor}-500 text-on${themeColor}`;
}

const themedTWMerge = extendTailwindMerge({
    extend : {
        classGroups : {
            rounded : [ {rounded : [ 'component', 'container' ]} ],
        },
    },
})

export
{
    FixedThemeColor, AppDynamicColorThemeColorSelector, getFixedThemeColorByValue, getColorClassesForFixedThemeColor,
        getAppDynamicColorTheme, getDefaultStyle, themedTWMerge
}

export type {OrgPlannerColorThemableComponentProps}
