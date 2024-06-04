import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import type { MyMD3Theme } from "../../providers/amity-ui-kit-provider";

export const useEnterGroupNameStyles = () => {
    const theme = useTheme() as MyMD3Theme;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            height: '100%',
        },
        header: {
            zIndex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        closeButton: {
            width: '10%',
            paddingVertical: 15,
        },
        doneContainer: { width: '15%', paddingVertical: 12, alignItems: 'flex-end' },
        headerTextContainer: {
            width: '75%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerText: {
            fontWeight: '600',
            fontSize: 17,
            textAlign: 'center',
            color: theme.colors.base
        },
        doneText: {
            color: theme.colors.primary
        },
        disabledDone: {
            opacity: 0.5
        },
        memberText: {
            fontWeight: '300',
            fontSize: 12,
            textAlign: 'left',
            color: theme.colors.baseShade1,
            marginTop: 15
        },
        inputWrap: {
            backgroundColor: theme.colors.baseShade4,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            marginVertical: 10,
            paddingVertical: 15,
        },
    });
    return styles;
}
