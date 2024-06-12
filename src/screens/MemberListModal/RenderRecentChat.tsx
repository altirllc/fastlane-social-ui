import React, { ReactElement, memo, useEffect, useState } from "react";
import { useStyles } from "./styles";
import { FlatList, View, Text } from "react-native";
import { TChannelObject } from "./MemberListModal";
import { EachChatObject } from "./EachChatObject";
import { UserInterface } from "../../../src/types";
import { ChannelRepository } from "@amityco/ts-sdk-react-native";
import useAuth from "../../../src/hooks/useAuth";

type TOnChannelSelected = (subChannelId: string, chatReceiver?: UserInterface | undefined) => Promise<void>

type TRenderRecentChat = {
    setLoadChannel: React.Dispatch<React.SetStateAction<boolean>>;
    loadChannel: boolean;
    onChannelSelected: TOnChannelSelected;
    channelObjects: TChannelObject[];
    setChannelObjects: React.Dispatch<React.SetStateAction<TChannelObject[]>>
}

type TRenderItem = {
    item: TChannelObject
    onChannelSelected: (subChannelId: string, chatReceiver?: UserInterface | undefined) => void
}
const RenderItem = ({ item, onChannelSelected }: TRenderItem): ReactElement => {
    return (
        <EachChatObject
            key={item.chatId}
            item={item}
            onChannelSelected={onChannelSelected}
        />
    );
};


export const RenderRecentChat = memo(({
    setLoadChannel,
    loadChannel,
    onChannelSelected,
    channelObjects,
    setChannelObjects
}: TRenderRecentChat) => {
    const styles = useStyles();
    const { isConnected } = useAuth();

    const [channelData, setChannelData] =
        useState<Amity.LiveCollection<Amity.Channel>>();
    const { data: channels = [], onNextPage, hasNextPage } = channelData ?? {};

    useEffect(() => {
        if (channels.length > 0) {
            const formattedChannelObjects: TChannelObject[] = channels.filter((eachChannel) => eachChannel.type !== 'broadcast').map(
                (item: Amity.Channel<any>) => {
                    const channel =
                        channelObjects.length > 0
                            ? channelObjects.find(
                                (eachChannel) => eachChannel.chatId === item.channelId
                            )
                            : null;
                    return {
                        chatId: item.channelId ?? '',
                        chatName: item.displayName ?? '',
                        chatMemberNumber: item.memberCount ?? 0,
                        channelType: item.type ?? '',
                        avatarFileId: item.avatarFileId,
                        selected: channel ? channel.selected : false,
                    };
                }
            );
            setChannelObjects([...formattedChannelObjects]);
            setLoadChannel(false);
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelData]);

    const onQueryChannel = () => {
        setLoadChannel(true);
        ChannelRepository.getChannels(
            {
                sortBy: 'lastActivity',
                limit: 15,
                membership: 'member',
                isDeleted: false,
            },
            (value) => {
                setChannelData(value);
                if (
                    value.data.length > 0 ||
                    (value.data.length === 0 && !value.hasNextPage && !value.loading)
                ) {
                    setTimeout(() => {
                        setLoadChannel(false);
                    }, 1000);
                }
            }
        );
    };

    useEffect(() => {
        onQueryChannel();
    }, [isConnected]);

    const handleLoadMore = () => {
        if (hasNextPage && onNextPage) {
            onNextPage();
        }
    };

    const toggleSelected = (subChannelId: string, chatReciever: UserInterface | undefined) => {
        setChannelObjects((prevChannels) =>
            prevChannels.map((eachChannel) => {
                if (eachChannel.chatId === subChannelId) {
                    return {
                        ...eachChannel,
                        selected: !eachChannel.selected,
                    };
                } else return eachChannel;
            })
        );
        onChannelSelected(subChannelId, chatReciever);
    }

    return !loadChannel ? (
        channelObjects.length > 0 ? (
            <FlatList
                data={channelObjects}
                renderItem={({ item }) => (
                    <RenderItem
                        item={item}
                        onChannelSelected={(subChannelId, chatReciever) => {
                            toggleSelected(subChannelId, chatReciever)
                        }}
                    />
                )}
                keyExtractor={(item) => item.chatId.toString()}
                onEndReached={handleLoadMore}
                // style={{ marginBottom: 50 }}
                showsVerticalScrollIndicator={false}
                onEndReachedThreshold={0.4}
            />
        ) : (
            <View style={styles.noMessageContainer}>
                <Text style={styles.noMessageText}>No Messages, yet.</Text>
                <Text style={styles.noMessageDesc}>
                    No messages in your inbox, yet!
                </Text>
            </View>
        )
    ) : null;
})
