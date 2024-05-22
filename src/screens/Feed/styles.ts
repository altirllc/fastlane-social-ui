import { Dimensions, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const styles = StyleSheet.create({
    feedWrap: {
      backgroundColor: theme.colors.baseShade4,
      height: '100%',
    },
    activityIndicator: {
      flex: 1,
      position: 'absolute',
      left: screenWidth / 2.1,
      top: screenHeight / 3.2,
    },
  });

  return styles;
};
