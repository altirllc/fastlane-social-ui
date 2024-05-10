import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    barContainer: {
      backgroundColor: theme.colors.background,
    },
    header: {
      zIndex: 1,
      padding: 12,
      paddingTop: 0,
      paddingEnd: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    closeButton: {
      padding: 10,
      zIndex: 1,
      left: 4,
    },
    headerTextContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: {
      fontWeight: '600',
      fontSize: 18,
      textAlign: 'center',
      color: theme.colors.base,
    },
    postText: {
      fontWeight: '400',
      fontSize: 15,
      textAlign: 'center',
      color: '#007AFF',
    },
    rowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    textInput: {
      borderWidth: 0,
      borderBottomWidth: 0,
      backgroundColor: 'transparent',
      fontSize: 15,
      marginHorizontal: 3,
      zIndex: 999,
      paddingVertical: 5,
      color: theme.colors.base,
      // Additional styles if needed
    },
    transparentText: {
      color: 'transparent',
    },
    inputContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    mentionText: {
      color: theme.colors.primary,
      fontSize: 15,
    },
    inputText: {
      color: theme.colors.base,
      fontSize: 15,
      letterSpacing: 0,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject, // Take up the whole screen
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingHorizontal: 3,
    },
    container: {
      padding: 16,
      paddingStart: 24,
    },
    AllInputWrap: {
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    InputWrap: {
      backgroundColor: '#FFFFF',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 15,
      paddingBottom: 35,
      paddingTop: 15,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#EBECEF',
    },
    iconWrap: {
      backgroundColor: '#EBECEF',
      borderRadius: 72,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 5,
      width: 35,
      height: 35,
    },
    imageContainer: {
      flexDirection: 'row',
      marginVertical: 30,
      flex: 3,
    },
    disabled: {
      opacity: 0.3,
    },
    videoContainer: {
      display: 'none',
    },
    rowContainerMyTimeLine: {
      marginVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    communityText: {
      marginLeft: 12,
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.base,
    },
    imageNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    communityName: {
      color: '#323642',
      fontSize: 14,
      fontWeight: '500',
    },
    communityNameContainer: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 28,
      backgroundColor: '#EDEFF5',
    },
  });

  return styles;
};
