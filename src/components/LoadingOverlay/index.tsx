import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from "react-native-paper";
import type { MyMD3Theme } from "../../providers/amity-ui-kit-provider";
interface LoadingOverlayProps {

}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ }) => {
  const theme = useTheme() as MyMD3Theme;
  const color = theme.colors.baseShade1;

  const getLoader = () => <ActivityIndicator color={color} />;

  const blockStyles = StyleSheet.compose(
    {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, .75)',
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    {}
  );
  return <View style={blockStyles}>{getLoader()}</View>;
};
