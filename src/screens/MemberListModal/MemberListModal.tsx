import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
// @ts-ignore
import { BottomModalScreen } from '../../../../../src/components/BottomModalScreen/BottomModalScreen';
// @ts-ignore
import { Separator } from '../../../../../src/components/Separator/Separator';
import { useStyles } from './styles';
import { getShadowProps } from '../../theme/helpers';
import { SendIcon } from '../../../src/svg/SendIcon';
import {
  ChannelRepository,
  MessageContentType,
  MessageRepository,
  getChannelTopic,
  subscribeTopic,
} from '@amityco/ts-sdk-react-native';
import useAuth from 'amity-react-native-social-ui-kit/src/hooks/useAuth';
import { LoadingOverlay } from 'amity-react-native-social-ui-kit/src/components/LoadingOverlay';
import { useNavigation, useRoute } from '@react-navigation/native';
// @ts-ignore
import { ECustomData } from '@amityco/react-native-cli-chat-ui-kit/src/screens/ChatRoom/ChatRoom';

type TChannelObject = {
  chatId: string;
  chatName: string;
  chatMemberNumber: number;
  channelType: 'conversation' | 'broadcast' | 'live' | 'community' | '';
  avatarFileId: string | undefined;
};

export const MemberListModal = () => {
  const { isConnected } = useAuth();
  const [loadChannel, setLoadChannel] = useState<boolean>(false);
  const styles = useStyles();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const postId = route?.params?.postId;

  const disposers: Amity.Unsubscriber[] = [];
  const subscribedChannels: Amity.Channel['channelId'][] = [];

  const [channelObjects, setChannelObjects] = useState<TChannelObject[]>([]);
  const [channelData, setChannelData] =
    useState<Amity.LiveCollection<Amity.Channel>>();

  const subscribeChannels = (channels: Amity.Channel[]) => {
    channels.forEach((c) => {
      if (!subscribedChannels.includes(c.channelId) && !c.isDeleted) {
        subscribedChannels.push(c.channelId);
        disposers.push(subscribeTopic(getChannelTopic(c)));
      }
    });
  };

  const { data: channels = [], onNextPage, hasNextPage } = channelData ?? {};

  const onChannelSelected = async (subChannelId: string) => {
    if (!postId || !subChannelId) return;
    const customMessage = {
      subChannelId: subChannelId,
      dataType: MessageContentType.CUSTOM,
      data: {
        id: postId,
        type: ECustomData.post,
      },
    };

    try {
      setLoadChannel(true);
      const { data: message } = await MessageRepository.createMessage(
        customMessage
      );
      console.log('message', message);
      if (message) {
        navigation.goBack();
      }
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadChannel(false);
    }
  };

  const renderItem = ({ item }: { item: TChannelObject; index: number }) => {
    return (
      <>
        <TouchableOpacity
          onPress={() => onChannelSelected(item.chatId)}
          style={[styles.itemContainer]}
        >
          <View style={styles.itemSubContainer}>
            {/* <Image source={{ uri: chapterImage }} style={styles.image} /> */}
            <View style={styles.itemChapterName}>
              <Text>{item.chatName}</Text>
            </View>
          </View>
          <View style={styles.itemIcon}>
            <SendIcon />
          </View>
        </TouchableOpacity>
        <Separator style={styles.itemSeparator} />
      </>
    );
  };

  useEffect(() => {
    if (channels.length > 0) {
      const formattedChannelObjects: TChannelObject[] = channels.map(
        (item: Amity.Channel<any>) => {
          return {
            chatId: item.channelId ?? '',
            chatName: item.displayName ?? '',
            chatMemberNumber: item.memberCount ?? 0,
            channelType: item.type ?? '',
            avatarFileId: item.avatarFileId,
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
    const unsubscribe = ChannelRepository.getChannels(
      {
        sortBy: 'lastActivity',
        limit: 15,
        membership: 'member',
        isDeleted: false,
      },
      (value) => {
        setChannelData(value);
        subscribeChannels(channels);
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
    disposers.push(unsubscribe);
  };

  useEffect(() => {
    onQueryChannel();
    return () => {
      disposers.forEach((fn) => fn());
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  const handleLoadMore = () => {
    if (hasNextPage && onNextPage) {
      onNextPage();
    }
  };

  const renderRecentChat = useMemo(() => {
    return !loadChannel ? (
      channelObjects.length > 0 ? (
        <FlatList
          data={channelObjects}
          renderItem={renderItem}
          keyExtractor={(item) => item.chatId.toString()}
          onEndReached={handleLoadMore}
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
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadChannel, channelObjects, handleLoadMore]);

  return (
    <BottomModalScreen style={styles.screen} horizontalIntent={false}>
      <View style={styles.header}>
        <Text style={styles.chatHeader}>Select a chat to send post</Text>
      </View>
      <Separator style={[styles.separator, { ...getShadowProps() }]} />
      {renderRecentChat}
      {loadChannel ? <LoadingOverlay isLoading /> : null}
    </BottomModalScreen>
  );
};
