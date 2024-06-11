import { SCREEN_PADDING } from '../../theme';
import { StyleSheet } from 'react-native';

export const useStyles = () => {
    const styles = StyleSheet.create({
        screen: {
            flex: 1,
            height: '100%',
        },
        header: {
            marginBottom: SCREEN_PADDING,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        chatHeader: { fontSize: 16, fontWeight: '500', textAlign: 'center' },
        itemSeparator: {
            backgroundColor: '#E1E5ED',
        },
        noLikesText: { marginTop: 100, textAlign: 'center' }
    });
    return styles;
};
