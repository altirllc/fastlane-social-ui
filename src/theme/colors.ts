import { ColorValue } from 'react-native';

enum AchromaticColorPalette {
  white = '#FFFFFF',
  'light-light' = '#FAFAFC',
  'middle-light' = '#F5F6FA',
  'dark-light' = '#EDEFF5',
  'light-middle' = '#E1E5ED',
  'middle-middle' = '#ABB2C2',
  'dark-middle' = '#6E768A',
  'light-dark' = '#50576B',
  'middle-dark' = '#323642',
  'dark-dark' = '#14151A',
  black = '#000000',
}

const colors = {
  blueGray: '#E8EFF3',
};

export const colorsLight: IColors = {
  ...colors,
  headerBackground: colors.blueGray,
  background: AchromaticColorPalette.white,
  transparent: 'transparent',
  cardMain: AchromaticColorPalette.white,
  primary: {
    100: AchromaticColorPalette['middle-middle'],
    300: AchromaticColorPalette['dark-middle'],
    500: AchromaticColorPalette['light-dark'],
    700: AchromaticColorPalette['middle-dark'],
    900: AchromaticColorPalette['dark-dark'],
    main: AchromaticColorPalette.black,
  },
  secondary: {
    main: AchromaticColorPalette.white,
    100: AchromaticColorPalette['light-light'],
    300: AchromaticColorPalette['middle-light'],
    500: AchromaticColorPalette['dark-light'],
    700: AchromaticColorPalette['light-middle'],
  },
  success: {
    main: '#34C759',
  },
  error: {
    main: '#FF3B30',
  },
  warning: {
    main: '#FF9500',
  },
  info: {
    main: '#4CC3FF',
  },
};

export const colorsDark: IColors = {
  ...colors,
  headerBackground: colors.blueGray,
  background: AchromaticColorPalette.black,
  transparent: 'transparent',
  cardMain: AchromaticColorPalette['middle-dark'],
  primary: {
    100: AchromaticColorPalette['middle-middle'],
    300: AchromaticColorPalette['light-middle'],
    500: AchromaticColorPalette['dark-light'],
    700: AchromaticColorPalette['middle-light'],
    900: AchromaticColorPalette['light-light'],
    main: AchromaticColorPalette.white,
  },
  secondary: {
    main: AchromaticColorPalette.black,
    100: AchromaticColorPalette['dark-dark'],
    300: AchromaticColorPalette['middle-dark'],
    500: AchromaticColorPalette['light-dark'],
    700: AchromaticColorPalette['dark-middle'],
  },
  success: {
    main: '#34C759',
  },
  error: {
    main: '#FF3B30',
  },
  warning: {
    main: '#FF9500',
  },
  info: {
    main: '#4CC3FF',
  },
};

interface IPalette {
  readonly [index: number]: ColorValue;
  main: ColorValue;
}

export interface IColors {
  readonly [index: string]: IPalette | ColorValue;
  transparent: ColorValue;
  primary: IPalette;
  secondary: IPalette;
  success: IPalette;
  info: IPalette;
  error: IPalette;
  warning: IPalette;
  headerBackground: ColorValue;
  background: ColorValue;
  blueGray: ColorValue;
  cardMain: ColorValue;
}
