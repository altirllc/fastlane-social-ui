import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
// @ts-ignore
import { BottomModalScreen } from '../../../../../src/components/BottomModalScreen/BottomModalScreen';
import { useStyles } from './styles';
import {
  MessageContentType,
  MessageRepository,
} from '@amityco/ts-sdk-react-native';
import { LoadingOverlay } from '../../../src/components/LoadingOverlay';
import { useNavigation, useRoute } from '@react-navigation/native';
// @ts-ignore
import { ECustomData } from '@amityco/react-native-cli-chat-ui-kit/src/screens/ChatRoom/ChatRoom';

// @ts-ignore
import { SwitchTab } from '../../../../../src/components/SwitchTab/SwitchTab';

import { UserInterface } from '../../../src/types';
import { RenderRecentChat } from './RenderRecentChat';
import { RenderAllMembers } from '../../../src/screens/MemberListModal/RenderAllMembers';
// @ts-ignore
import { createAmityChannel } from '@amityco/react-native-cli-chat-ui-kit/src/providers/channel-provider';
import useAuth from '../../../src/hooks/useAuth';

export type TChannelObject = {
  chatId: string;
  chatName: string;
  chatMemberNumber: number;
  channelType: 'conversation' | 'broadcast' | 'live' | 'community' | '';
  avatarFileId: string | undefined;
  selected: boolean;
};

type TTab = {
  index: number;
  label: 'Recent chat' | 'All members';
  testID: string;
}

export const TABS: TTab[] = [
  { index: 0, label: 'Recent chat', testID: 'RecentChatTabID' },
  { index: 1, label: 'All members', testID: 'AllMembersTabID' },
];

type TSelectedChatRecievers = Map<string, { chatReceiver: UserInterface }>
export type TSelectedChat = { id: string; chatMemberNumber: number }

export const MemberListModal = () => {
  const [loadChannel, setLoadChannel] = useState<boolean>(false);
  const styles = useStyles();
  const route = useRoute<any>();
  const { client } = useAuth();
  const navigation = useNavigation<any>();
  const postId = route?.params?.postId;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedChatRecievers, setSelectedChatRecievers] = useState<TSelectedChatRecievers>(new Map())

  //selected recentChats
  const [channelObjects, setChannelObjects] = useState<TChannelObject[]>([]);

  //selected members from "All members" tab
  const [sectionedUserList, setSectionedUserList] = useState<UserInterface[]>([]);
  const [selectedSectionedUsers, setSelectedSectionedUsers] =
    useState<UserInterface[]>([]);

  const selectedRecentChats = useMemo(() => {
    return channelObjects.filter((each) => each.selected)
  }, [channelObjects])

  const totalSelectedLength = useMemo(() => {
    return selectedRecentChats.length + selectedSectionedUsers.length;
  }, [selectedRecentChats, selectedSectionedUsers])

  const shouldShowCreateGroup = useMemo(() => {
    /*
    we need to show this button in following scenarios
    1.when more than 1 chat is selected
    2.when all selected chats from recent chats are one to one
    */
    if (selectedIndex === 0) {
      return totalSelectedLength > 1 && selectedRecentChats.every((eachChat) => eachChat.chatMemberNumber === 2);
    } else return totalSelectedLength > 1;
  }, [selectedRecentChats, totalSelectedLength])

  const sendButtonText = useMemo(() => {
    return totalSelectedLength > 1 ? 'Send separately' : 'Send'
  }, [totalSelectedLength])

  const onAllMemberGroupSendClick = async () => {
    if (!postId || selectedSectionedUsers.length === 0) return;
    navigation.navigate("EnterGroupName", { selectedUserList: selectedSectionedUsers, postId })
  }

  const onSendAllMembersClick = async () => {
    if (!postId || selectedSectionedUsers.length === 0) return;
    //first off all for every selected member, create the separate channel with logged in user.
    setLoadChannel(true);

    const createChannelPromises = selectedSectionedUsers.map((eachMember) => {
      return createAmityChannel(
        (client as Amity.Client).userId as string,
        [eachMember]
      );
    });

    try {
      // Wait for all promises to be resolved
      const newChannels = await Promise.all(createChannelPromises);

      // Now for each of the newly created channel, send message to that channel
      const messageCreationPromises = newChannels.map((eachChannel) => {
        const customMessage = {
          subChannelId: eachChannel.channelId,
          dataType: MessageContentType.CUSTOM,
          data: {
            id: postId,
            type: ECustomData.post,
          },
        };
        return MessageRepository.createMessage(customMessage);
      });

      // Wait for all promises to be resolved
      await Promise.all(messageCreationPromises);

    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadChannel(false);
      navigation.goBack();
    }
  }

  const onSendClick = useCallback(async () => {
    if (!postId || selectedRecentChats.length === 0) return;
    setLoadChannel(true);

    // Create an array to hold all the promises
    const promises = selectedRecentChats.map((eachChannel) => {
      const customMessage = {
        subChannelId: eachChannel.chatId,
        dataType: MessageContentType.CUSTOM,
        data: {
          id: postId,
          type: ECustomData.post,
        },
      };
      return MessageRepository.createMessage(customMessage);
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

  const onSendToGroupClick = () => {
    if (selectedRecentChats.length <= 0) return;
    let selectedUserList: UserInterface[] = [];
    selectedChatRecievers.forEach((value) => {
      selectedUserList.push(value.chatReceiver)
    });
    navigation.navigate("EnterGroupName", { selectedUserList, postId })
  }

  const pushToChatRecievers = useCallback((chatId: string, chatReceiver: UserInterface) => {
    setSelectedChatRecievers((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(chatId, { chatReceiver });
      return newMap;
    });
  }, []);


  const removeFromChatRecievers = useCallback((chatId: string) => {
    setSelectedChatRecievers((prevMap) => {
      const newMap = new Map(prevMap);
      if (newMap.has(chatId)) {
        newMap.delete(chatId)
      }
      return newMap;
    });
  }, []);

  const onChannelSelected = useCallback(async (subChannelId: string, chatReceiver?: UserInterface | undefined) => {
    if (!subChannelId) return;
    if (chatReceiver) {
      if (selectedChatRecievers.has(subChannelId)) {
        //if chat is already selected
        removeFromChatRecievers(subChannelId)
      } else {
        //if chat is not already selected
        pushToChatRecievers(subChannelId, chatReceiver)
      }
    }
  }, [selectedChatRecievers, removeFromChatRecievers, pushToChatRecievers]);

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
        {
          TABS.length > 0 ? (
            <View style={{ marginBottom: 10 }}>
              <SwitchTab items={TABS} onChange={index => {
                setSelectedIndex(index)
                setSectionedUserList([]);
                setChannelObjects([])
              }} />
            </View>
          ) : null
        }
        {
          selectedIndex === 0 ?
            <RenderRecentChat
              onChannelSelected={onChannelSelected}
              setLoadChannel={setLoadChannel}
              loadChannel={loadChannel}
              channelObjects={channelObjects}
              setChannelObjects={setChannelObjects}
            />
            : null
        }
        {
          selectedIndex === 1 ? (
            <RenderAllMembers
              sectionedUserList={sectionedUserList}
              setSectionedUserList={setSectionedUserList}
              selectedSectionedUsers={selectedSectionedUsers}
              setSelectedSectionedUsers={setSelectedSectionedUsers}
            />
          ) : null
        }
        <View style={styles.buttonContainer}>
          {shouldShowCreateGroup ? (
            <TouchableOpacity
              onPress={selectedIndex === 0 ? onSendToGroupClick : onAllMemberGroupSendClick}
              style={styles.sendButtonContainer}
            >
              <Text style={styles.sendButtontext}>{`Send to group (${totalSelectedLength})`}</Text>
            </TouchableOpacity>
          ) : null}
          {shouldShowCreateGroup &&
            totalSelectedLength > 0 && <View style={styles.buttonSeparator} />}
          {totalSelectedLength > 0 ? (
            <TouchableOpacity
              onPress={selectedIndex === 0 ? onSendClick : onSendAllMembersClick}
              style={styles.sendButtonContainer}
            >
              <Text style={styles.sendButtontext}>{`${sendButtonText} (${totalSelectedLength})`}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </BottomModalScreen>
      {loadChannel ? <LoadingOverlay isLoading /> : null}
    </>
  );
};
