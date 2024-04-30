import { useColorScheme } from 'react-native';

import { colorsLight, colorsDark, IColors } from '../theme/colors';

export type TTheme = {
  colors: IColors;
  isDark: boolean;
};

export const useCustomTheme = (): TTheme => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark'
    ? { colors: colorsDark, isDark: true }
    : { colors: colorsLight, isDark: false };
};
