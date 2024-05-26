import { useTheme } from 'react-native-paper';
import { SCREEN_PADDING } from '../../theme';
import { StyleSheet } from 'react-native';
import { MyMD3Theme } from 'amity-react-native-social-ui-kit/src/providers/amity-ui-kit-provider';

export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      height: '80%',
    },
    headerStyle: {
      backgroundColor: '#FFFFFF',
    },
    allEventsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: SCREEN_PADDING,
    },
    allEventsSubContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    title: {
      textAlign: 'center',
    },
    description: {
      textAlign: 'center',
      marginTop: 10,
    },
    listItem: {
      marginTop: 16,
      paddingHorizontal: SCREEN_PADDING,
    },
    header: {
      alignSelf: 'center',
      marginBottom: SCREEN_PADDING,
    },
    chapterName: {
      alignSelf: 'center',
      marginStart: SCREEN_PADDING,
    },
    icon: {
      alignSelf: 'center',
    },
    iconStackContainer: {
      height: 40,
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    separator: {
      backgroundColor: '#E1E5ED',
    },
    itemContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: SCREEN_PADDING,
    },
    itemSubContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    itemIcon: {
      alignSelf: 'center',
    },
    iconChevronRight: {
      alignSelf: 'center',
    },
    image: {
      height: 40,
      width: 40,
      borderRadius: 4,
      alignSelf: 'center',
      backgroundColor: '#EDEFF5',
    },
    itemChapterName: {
      alignSelf: 'center',
      marginStart: SCREEN_PADDING,
    },
    itemSeparator: {
      backgroundColor: '#E1E5ED',
    },
    noMessageContainer: {
      backgroundColor: theme.colors.background,
      height: 100,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 50,
    },
    noMessageText: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
    noMessageDesc: {
      fontSize: 14,
      fontWeight: 'normal',
      color: theme.colors.base,
    },
    chatHeader: { fontSize: 15, fontWeight: '500' },
  });
  return styles;
};
