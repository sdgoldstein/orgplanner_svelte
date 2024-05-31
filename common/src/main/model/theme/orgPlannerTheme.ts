import {GuardedMap} from '@sphyrna/tscore';

type ColorHex = `#${string}`;

interface OrgPlannerColorTheme {
  name: string;
  label: string;
  managerColor: ColorHex;
  icColor: ColorHex;
  teamColor: ColorHex;
}

class OrgPlannerColorThemes {
  private static readonly NAME_TO_THEME_MAP:
      GuardedMap<string, OrgPlannerColorTheme> =
          new Map<string, OrgPlannerColorTheme>();

  static readonly DEEP_BLUE_THEME: OrgPlannerColorTheme = {
    name: 'DEEP_BLUE_THEME',
    label: 'Deep Blue',
    managerColor: '#00004d',
    teamColor: '#000080',
    icColor: '#0000b3'
  };
  static readonly DEEP_RED_THEME: OrgPlannerColorTheme = {
    name: 'DEEP_RED_THEME',
    label: 'Deep Red',
    managerColor: '#4d0000',
    teamColor: '#800000',
    icColor: '#b30000'
  };
  static readonly DEEP_GREEN_THEME: OrgPlannerColorTheme = {
    name: 'DEEP_GREEN_THEME',
    label: 'Deep Green',
    managerColor: '#004d00',
    teamColor: '#008000',
    icColor: '#00b300'
  };

  static {
    OrgPlannerColorThemes.NAME_TO_THEME_MAP.set(
        this.DEEP_BLUE_THEME.name, this.DEEP_BLUE_THEME);
    OrgPlannerColorThemes.NAME_TO_THEME_MAP.set(
        this.DEEP_RED_THEME.name, this.DEEP_RED_THEME);
    OrgPlannerColorThemes.NAME_TO_THEME_MAP.set(
        this.DEEP_GREEN_THEME.name, this.DEEP_GREEN_THEME);
  }
  static getColorThemeByName(name: string): OrgPlannerColorTheme {
    if (!this.NAME_TO_THEME_MAP.has(name)) {
      throw new Error('Color theme by name not found, ' + name);
    }

    return this.NAME_TO_THEME_MAP.get(name);
  }

  static themeIterator(): IterableIterator<OrgPlannerColorTheme> {
    return this.NAME_TO_THEME_MAP.values();
  }
}

export {OrgPlannerColorThemes};
export type {OrgPlannerColorTheme, ColorHex};
