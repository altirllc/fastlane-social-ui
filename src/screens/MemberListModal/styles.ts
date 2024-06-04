import { useTheme } from 'react-native-paper';
import { SCREEN_PADDING } from '../../theme';
import { StyleSheet } from 'react-native';
import { MyMD3Theme } from '../../../src/providers/amity-ui-kit-provider';
// @ts-ignore
import { AVATAR_SIZE } from '@amityco/react-native-cli-chat-ui-kit/src/components/Avatar/Avatar.styles';

export const imagesize = AVATAR_SIZE;
export const useStyles = () => {
  const theme = useTheme() as MyMD3Theme;
  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      height: '100%',
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
      marginBottom: SCREEN_PADDING,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
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
      paddingVertical: 10,
      alignItems: 'center',
    },
    imageContainer: {
      width: '15%',
    },
    sendIcon: {
      width: '15%',
      alignItems: 'flex-end',
    },
    iconChevronRight: {
      alignSelf: 'center',
    },
    image: {
      height: imagesize,
      width: imagesize,
      borderRadius: imagesize / 2,
      alignItems: 'center',
      backgroundColor: '#EDEFF5',
      justifyContent: 'center',
    },
    chatName: {
      width: '70%',
      paddingHorizontal: 10,
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
    chatHeader: { fontSize: 16, fontWeight: '500', textAlign: 'center' },
    recentChatText: { fontSize: 12, fontWeight: '300', textAlign: 'left', marginBottom: 15 },
    chatDisplayName: { fontSize: 15, fontWeight: '500' },
    sendButtontext: {
      fontWeight: '700',
      color: theme.colors.background,
      fontSize: 16,
    },
    buttonSeparator: {
      width: '8%',
    },
    sendButtonContainer: {
      flex: 1,
      //width: '45%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#14151A',
      borderRadius: 15,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      height: 50,
      position: 'absolute',
      bottom: 0,
    },
    inputWrap: {
      backgroundColor: theme.colors.baseShade4,
      borderRadius: 30,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 10,
      marginVertical: 10,
      paddingVertical: 10,
      borderWidth: 1,
    },
    input: { flex: 1, marginHorizontal: 6 },
  });
  return styles;
};
