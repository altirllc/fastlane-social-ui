import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    TextInput,
    FlatList,
    ListRenderItemInfo,
    Keyboard,
} from 'react-native';
import { useEnterGroupNameStyles } from './styles'
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CircleCloseIcon } from '../../svg/CircleCloseIcon';
import { UserInterface } from '../../../src/types/user.interface';
import UserItem from '../../../src/components/UserItem';
import useAuth from '../../hooks/useAuth';
import { LoadingOverlay } from '../../../src/components/LoadingOverlay';
import { BackIcon } from '../../svg/BackIcon';
import { createAmityChannel, updateAmityChannel } from '@amityco/react-native-cli-chat-ui-kit/src/providers/channel-provider';
// @ts-ignore
import { BottomModalScreen } from '../../../../../src/components/BottomModalScreen/BottomModalScreen';
import { MessageContentType, MessageRepository } from '@amityco/ts-sdk-react-native';
import { ECustomData } from '@amityco/react-native-cli-chat-ui-kit/src/screens/ChatRoom/ChatRoom';

export const EnterGroupName = () => {
    const theme = useTheme() as MyMD3Theme;
    const styles = useEnterGroupNameStyles();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const [inputMessage, setInputMessage] = useState('');
    const inputRef = useRef<any>();
    const [loading, setLoading] = useState(false);
    const { client } = useAuth();
    const [isFocused, setIsFocused] = useState(false)

    const selectedUserList = route?.params?.selectedUserList as UserInterface[];
    const postId = route?.params?.postId as string;

    const isDisabled = useMemo(() => {
        return !inputMessage || loading
    }, [inputMessage, loading])

    useEffect(() => {
        if (inputRef.current) {
            inputRef?.current?.focus();
            setIsFocused(true)
        }
    }, [])

    const goBack = () => {
        navigation.goBack();
    }

    const updateGroupName = async (channel: Amity.Channel<any>, updatedInputmessage: string) => {
        const result = await updateAmityChannel(
            channel._id,
            '',
            updatedInputmessage
        );
        return result;
    }

    const onCreateClick = async () => {
        const updatedInputmessage = inputMessage.trim()
        Keyboard.dismiss()
        //first create a channel
        setLoading(true);
        const channel = await createAmityChannel((client as Amity.Client).userId as string, selectedUserList);
        if (channel) {
            try {
                if (updatedInputmessage) {
                    const result = await updateGroupName(channel, updatedInputmessage)
                    if (result) {
                        console.log("updateGroupName success", JSON.stringify(result))
                        if (postId) {
                            const customMessage = {
                                subChannelId: channel.channelId,
                                dataType: MessageContentType.CUSTOM,
                                data: {
                                    id: postId,
                                    type: ECustomData.post,
                                },
                            };
                            await MessageRepository.createMessage(customMessage);
                        }
                    }
                }
                setLoading(false)
                navigation.pop(2);
                console.log('create chat success ' + JSON.stringify(channel));
            } catch (error) {
                setLoading(false)
                console.log('create chat error ' + JSON.stringify(error));
                console.error(error);
            }
        }
    }

    const clearGroupName = () => {
        setInputMessage('')
    }

    const renderItem = ({ item }: ListRenderItemInfo<UserInterface>) => {
        const userObj: UserInterface = { userId: item.userId, displayName: item.displayName as string, avatarFileId: item.avatarFileId as string, chapterName: item.chapterName }

        return (
            <UserItem hztPadding={false} showCheckMark={false} showThreeDot={false} user={userObj} />
        );
    };

    return (
        <>
            <BottomModalScreen
                onHolderPress={() => navigation.goBack()}
                style={styles.container}
                horizontalIntent={true}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => {
                        goBack();
                    }}>
                        <BackIcon color={theme.colors.base} />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerText}>New Group Chat</Text>
                    </View>
                    <TouchableOpacity disabled={isDisabled} style={[styles.doneContainer, isDisabled && styles.disabledDone]} onPress={onCreateClick}>
                        <Text style={styles.doneText}>{'Send'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.inputWrap, { borderWidth: 1, borderColor: isFocused ? theme.colors.base : theme.colors.baseShade3 }]}>
                    <TextInput
                        ref={inputRef as any}
                        onFocus={() => { setIsFocused(true) }}
                        onBlur={() => { setIsFocused(false) }}
                        value={inputMessage}
                        onChangeText={(text) => setInputMessage(text)}
                        placeholder="Conversation Name..."
                        placeholderTextColor={theme.colors.baseShade3}
                    />
                    <TouchableOpacity onPress={clearGroupName}>
                        <CircleCloseIcon color={theme.colors.base} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.memberText}>Members</Text>
                <FlatList
                    data={selectedUserList || []}
                    renderItem={renderItem}
                    style={{ marginTop: 15 }}
                    keyExtractor={(item) => item.userId}
                    showsVerticalScrollIndicator={false}
                />
            </BottomModalScreen>
            {loading ? <LoadingOverlay /> : null}
        </>
    )
}