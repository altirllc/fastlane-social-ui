import { Platform } from 'react-native';

const FONT_NAME = 'Metropolis';

enum EFontFamilies {
  thin = 'Thin',
  thinItalic = 'ThinItalic',
  extraLight = 'ExtraLight',
  extraLightItalic = 'ExtraLightItalic',
  light = 'Light',
  lightItalic = 'LightItalic',
  regular = 'Regular',
  regularItalic = 'RegularItalic',
  medium = 'Medium',
  mediumItalic = 'MediumItalic',
  semiBold = 'SemiBold',
  semiBoldItalic = 'SemiBoldItalic',
  bold = 'Bold',
  boldItalic = 'BoldItalic',
  black = 'Black',
  blackItalic = 'BlackItalic',
  extraBold = 'ExtraBold',
  extraBoldItalic = 'ExtraBoldItalic',
}

export const fontFamilies: IFontFamilies = Platform.select({
  ios: {
    thin: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.thin}`,
      fontWeight: '100',
    },
    thinItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.thinItalic}`,
      fontWeight: '100',
    },
    extraLight: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.extraLight}`,
      fontWeight: '200',
    },
    extraLightItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.extraLightItalic}`,
      fontWeight: '200',
    },
    light: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.light}`,
      fontWeight: '300',
    },
    lightItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.lightItalic}`,
      fontWeight: '300',
    },
    regular: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.regular}`,
      fontWeight: '400',
    },
    regularItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.regularItalic}`,
      fontWeight: '400',
    },
    medium: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.medium}`,
      fontWeight: '500',
    },
    mediumItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.mediumItalic}`,
      fontWeight: '500',
    },
    semiBold: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.semiBold}`,
      fontWeight: '600',
    },
    semiBoldItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.semiBoldItalic}`,
      fontWeight: '600',
    },
    bold: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.bold}`,
      fontWeight: '700',
    },
    boldItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.boldItalic}`,
      fontWeight: '700',
    },
    black: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.black}`,
      fontWeight: '800',
    },
    blackItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.blackItalic}`,
      fontWeight: '800',
    },
    extraBold: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.extraBold}`,
      fontWeight: '900',
    },
    extraBoldItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.extraBoldItalic}`,
      fontWeight: '900',
    },
  },
  default: {
    thin: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.thin}`,
      fontWeight: undefined,
    },
    thinItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.thinItalic}`,
      fontWeight: undefined,
    },
    extraLight: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.extraLight}`,
      fontWeight: undefined,
    },
    extraLightItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.extraLightItalic}`,
      fontWeight: undefined,
    },
    light: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.light}`,
      fontWeight: undefined,
    },
    lightItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.lightItalic}`,
      fontWeight: undefined,
    },
    regular: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.regular}`,
      fontWeight: undefined,
    },
    regularItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.regularItalic}`,
      fontWeight: undefined,
    },
    medium: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.medium}`,
      fontWeight: undefined,
    },
    mediumItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.mediumItalic}`,
      fontWeight: undefined,
    },
    semiBold: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.semiBold}`,
      fontWeight: undefined,
    },
    semiBoldItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.semiBoldItalic}`,
      fontWeight: undefined,
    },
    bold: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.bold}`,
      fontWeight: undefined,
    },
    boldItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.boldItalic}`,
      fontWeight: undefined,
    },
    black: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.black}`,
      fontWeight: undefined,
    },
    blackItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.blackItalic}`,
      fontWeight: undefined,
    },
    extraBold: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.extraBold}`,
      fontWeight: undefined,
    },
    extraBoldItalic: {
      fontFamily: `${FONT_NAME}-${EFontFamilies.extraBoldItalic}`,
      fontWeight: undefined,
    },
  },
});

interface IFontFamilies {
  readonly [index: string]: IFontFamily;
  thin: IFontFamily;
  thinItalic: IFontFamily;
  extraLight: IFontFamily;
  extraLightItalic: IFontFamily;
  light: IFontFamily;
  lightItalic: IFontFamily;
  regular: IFontFamily;
  regularItalic: IFontFamily;
  medium: IFontFamily;
  mediumItalic: IFontFamily;
  semiBold: IFontFamily;
  semiBoldItalic: IFontFamily;
  bold: IFontFamily;
  boldItalic: IFontFamily;
  black: IFontFamily;
  blackItalic: IFontFamily;
  extraBold: IFontFamily;
  extraBoldItalic: IFontFamily;
}

interface IFontFamily {
  fontFamily: string;
  fontWeight:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900'
    | undefined;
}
