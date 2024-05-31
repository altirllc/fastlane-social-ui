import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
// @ts-ignore
import { BottomModalScreen } from '../../../../src/components/BottomModalScreen/BottomModalScreen';
// @ts-ignore
import { Separator } from '../../../../src/components/Separator/Separator';
import { useStyles } from './styles';
import {
  ChannelRepository,
  MessageContentType,
  MessageRepository,
} from '@amityco/ts-sdk-react-native';
import useAuth from '../../../src/hooks/useAuth';
import { LoadingOverlay } from '../../../src/components/LoadingOverlay';
import { useNavigation, useRoute } from '@react-navigation/native';
// @ts-ignore
import { ECustomData } from '@amityco/react-native-cli-chat-ui-kit/src/screens/ChatRoom/ChatRoom';
// import uiSlice from 'amity-react-native-social-ui-kit/src/redux/slices/uiSlice';
// import { useDispatch } from 'react-redux';
// import Toast from '../../components/Toast/Toast';
import { EachChatObject } from './EachChatObject';

export type TChannelObject = {
  chatId: string;
  chatName: string;
  chatMemberNumber: number;
  channelType: 'conversation' | 'broadcast' | 'live' | 'community' | '';
  avatarFileId: string | undefined;
  selected: boolean;
};

export const MemberListModal = () => {
  const { isConnected } = useAuth();
  const [loadChannel, setLoadChannel] = useState<boolean>(false);
  const styles = useStyles();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const postId = route?.params?.postId;

  const [channelObjects, setChannelObjects] = useState<TChannelObject[]>([]);
  const [channelData, setChannelData] =
    useState<Amity.LiveCollection<Amity.Channel>>();

  const shouldShowSend = useMemo(() => {
    return channelObjects.some((eachChannel) => eachChannel.selected);
  }, [channelObjects]);

  const { data: channels = [], onNextPage, hasNextPage } = channelData ?? {};

  const onSendClick = useCallback(async () => {
    if (!postId || !channelObjects) return;
    setLoadChannel(true);
    // for (const eachChannel of channelObjects) {
    //   if (eachChannel.selected) {
    //     const customMessage = {
    //       subChannelId: eachChannel.chatId,
    //       dataType: MessageContentType.CUSTOM,
    //       data: {
    //         id: postId,
    //         type: ECustomData.post,
    //       },
    //     };
    //     const { data: message } = await MessageRepository.createMessage(
    //       customMessage
    //     );
    //     console.log('message', message);
    //   }
    // }
    // Create an array to hold all the promises
    const promises = channelObjects.map((eachChannel) => {
      if (eachChannel.selected) {
        const customMessage = {
          subChannelId: eachChannel.chatId,
          dataType: MessageContentType.CUSTOM,
          data: {
            id: postId,
            type: ECustomData.post,
          },
        };
        return MessageRepository.createMessage(customMessage);
      }
      // Return a resolved promise for unselected channels to keep the array length consistent
      return Promise.resolve(null);
    });

    try {
      // Wait for all promises to be resolved
      const results = await Promise.all(promises);

      // Process the results
      results.forEach((result) => {
        if (result) {
          const { data: message } = result;
          console.log('message', message);
        }
      });
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadChannel(false);
      navigation.goBack();
    }
  }, [postId, navigation, channelObjects]);

  const onChannelSelected = useCallback(async (subChannelId: string) => {
    if (!subChannelId) return;
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
  }, []);

  useEffect(() => {
    if (channels.length > 0) {
      const formattedChannelObjects: TChannelObject[] = channels.map(
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

  const renderItem = (item: TChannelObject): ReactElement => {
    return (
      <EachChatObject
        key={item.chatId}
        item={item}
        onChannelSelected={onChannelSelected}
      />
    );
  };

  const renderRecentChat = useMemo(() => {
    return !loadChannel ? (
      channelObjects.length > 0 ? (
        <FlatList
          data={channelObjects}
          renderItem={({ item }) => renderItem(item)}
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
    <>
      <BottomModalScreen
        onHolderPress={() => navigation.goBack()}
        style={styles.screen}
        horizontalIntent={true}
      >
        <View style={styles.header}>
          <Text style={styles.chatHeader}>Select a chat</Text>
        </View>
        <Separator style={[styles.separator]} />
        {renderRecentChat}
        {shouldShowSend ? (
          <TouchableOpacity
            onPress={onSendClick}
            style={styles.sendButtonContainer}
          >
            <Text style={styles.sendButtontext}>Send</Text>
          </TouchableOpacity>
        ) : null}
      </BottomModalScreen>
      {loadChannel ? <LoadingOverlay isLoading /> : null}
    </>
  );
};
