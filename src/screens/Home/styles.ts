import { SCREEN_PADDING } from '../../theme';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MyMD3Theme } from 'src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const { top } = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      height: '100%',
      width: '100%',
      paddingTop: top + 1,
      backgroundColor: theme.colors.background,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      padding: 20,
      minHeight: 120,
    },
    scrollContentContainer: {
      flexGrow: 1,
      justifyContent: 'flex-end',
    },
    modalText: {
      fontSize: 18,
      marginBottom: 10,
      textAlign: 'center',
    },
    closeButton: {
      backgroundColor: '#007AFF',
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginTop: 10,
    },
    modalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5,
      marginVertical: 5,
    },
    closeButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    postText: {
      paddingLeft: 12,
      fontWeight: '600',
      color: theme.colors.base,
    },
    invisible: {
      display: 'none',
    },
    visible: {
      display: 'flex',
    },
    btnWrap: {
      padding: 5,
    },
    createFeedButton: {
      display: 'none',
    },
    createFeedButtonWithoutProfileComplete: {
      position: 'absolute',
      bottom: 27, // fasle: when profile card is not visible
      right: 24,
      width: 56,
      height: 56,
      // top: 0,
      zIndex: 100,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    welcomeContainer: {
      paddingHorizontal: SCREEN_PADDING,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingBottom: 16,
    },
    width1: {
      width: '10%',
      alignItems: 'center',
    },
    width2: {
      width: '80%',
      alignItems: 'center',
    },
    titleContainer: {
      flexDirection: 'row',
    },
    marketplaceContainer: {
      width: '100%',
      alignSelf: 'flex-start',
      flexDirection: 'row',
      paddingVertical: 16,
      paddingHorizontal: SCREEN_PADDING,
    },
    marketplaceTitle: {
      fontWeight: '600',
      fontSize: 24,
    },
    chevronDownIcon: {
      alignSelf: 'center',
      marginStart: 12,
    },
    chapterName: {
      fontWeight: '600',
    },
    cardContainer: {
      paddingHorizontal: SCREEN_PADDING,
      paddingBottom: SCREEN_PADDING,
    },
  });

  return styles;
};
