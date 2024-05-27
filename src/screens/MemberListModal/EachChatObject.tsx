import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
// @ts-ignore
// @ts-ignore
import { Separator } from '../../../../../src/components/Separator/Separator';
import { SendIcon } from '../../../src/svg/SendIcon';
import { ChannelRepository } from '@amityco/ts-sdk-react-native';
// @ts-ignore
// import uiSlice from 'amity-react-native-social-ui-kit/src/redux/slices/uiSlice';
// import { useDispatch } from 'react-redux';
// import Toast from '../../components/Toast/Toast';
// @ts-ignore
import { Avatar } from '@amityco/react-native-cli-chat-ui-kit/src/components/Avatar/Avatar';
// @ts-ignore
import { PrivateChatIcon } from '@amityco/react-native-cli-chat-ui-kit/src/svg/PrivateChatIcon';
// @ts-ignore
import { useAvatarArray } from '@amityco/react-native-cli-chat-ui-kit/src/hooks/useAvatarArray';
// @ts-ignore
import { EUserRoles } from '@amityco/react-native-cli-chat-ui-kit/src/enum/sessionState';
// @ts-ignore
import { UserInterface } from '@amityco/react-native-cli-chat-ui-kit/src/types/user.interface';
// @ts-ignore
import { IGroupChatObject } from '@amityco/react-native-cli-chat-ui-kit/src/components/ChatList';
import useAuth from '../../../src/hooks/useAuth';
import { imagesize, useStyles } from './styles';

export type TChatList = {
  chatId: string;
  chatName: string;
  chatMemberNumber: number;
  channelType: 'conversation' | 'broadcast' | 'live' | 'community' | '';
  avatarFileId: string | undefined;
  onChannelSelected: (subChannelId: string) => void;
};
export const EachChatObject = ({
  chatId,
  chatName,
  chatMemberNumber,
  channelType,
  avatarFileId,
  onChannelSelected,
}: TChatList) => {
  const { apiRegion, client } = useAuth();
  const styles = useStyles();

  const [usersObject, setUsersObject] =
    useState<Amity.LiveCollection<Amity.Membership<'channel'>>>();
  const { data: usersArr = [] } = usersObject ?? {};

  const [oneOnOneChatObject, setOneOnOneChatObject] =
    useState<Amity.Membership<'channel'>[]>();
  const [groupChatObject, setGroupChatObject] =
    useState<Amity.Membership<'channel'>[]>();

  const avatarId = useMemo(() => {
    //return latest avatarID
    if (oneOnOneChatObject) {
      const targetIndex: number = oneOnOneChatObject?.findIndex(
        (item) => item.userId !== (client as Amity.Client).userId
      );
      return (
        (oneOnOneChatObject &&
          oneOnOneChatObject[targetIndex]?.user?.avatarFileId) ||
        ''
      );
    } else if (groupChatObject) {
      return avatarFileId;
    } else return '';
  }, [oneOnOneChatObject, groupChatObject, avatarFileId, client]);

  const chatDisplayName = useMemo(() => {
    //return latest chat name
    if (oneOnOneChatObject) {
      const targetIndex: number = oneOnOneChatObject?.findIndex(
        (item) => item.userId !== (client as Amity.Client).userId
      );
      return oneOnOneChatObject[targetIndex]?.user?.displayName as string;
    } else if (groupChatObject) {
      return chatName;
    } else return '';
  }, [oneOnOneChatObject, groupChatObject, chatName, client]);

  const groupChat = useMemo(() => {
    if (groupChatObject && groupChatObject?.length > 0) {
      const userArr: UserInterface[] = groupChatObject?.map((item) => {
        return {
          userId: item.userId as string,
          displayName: item.user?.displayName as string,
          avatarFileId: item.user?.avatarFileId as string,
        };
      });
      let channelModerator = groupChatObject?.find((eachUser) =>
        eachUser.roles?.includes(EUserRoles['channel-moderator'])
      );
      const groupChatObj: IGroupChatObject = {
        users: userArr,
        displayName: chatName as string,
        avatarFileId: avatarFileId,
        memberCount: chatMemberNumber,
      };
      if (channelModerator) {
        //if channel admin exist, add its info separately
        // @ts-ignore
        groupChatObj.channelModerator = {
          userId: channelModerator.userId,
        };
      }
      return groupChatObj;
    }
    return undefined;
  }, [groupChatObject, chatName, avatarFileId, chatMemberNumber]);

  const { avatarArray } = useAvatarArray(groupChat);

  useEffect(() => {
    if (chatMemberNumber === 2 && usersArr) {
      setOneOnOneChatObject(usersArr);
    } else if (usersArr) {
      setGroupChatObject(usersArr);
    }
  }, [usersArr, chatMemberNumber]);

  useEffect(() => {
    ChannelRepository.Membership.getMembers(
      { channelId: chatId, limit: 100 },
      (data) => {
        setUsersObject(data);
      }
    );
  }, [chatId]);

  return (
    <>
      <TouchableOpacity
        onPress={() => onChannelSelected(chatId)}
        style={[styles.itemContainer]}
        activeOpacity={0.5}
      >
        <View style={[styles.imageContainer, styles.image]}>
          {avatarId ? (
            <Image
              source={{
                uri: `https://api.${apiRegion}.amity.co/api/v3/files/${avatarId}/download?size=medium`,
              }}
              style={styles.image}
            />
          ) : (
            <View style={styles.image}>
              {channelType === 'community' ? (
                <Avatar
                  heightProp={imagesize}
                  widthProp={imagesize}
                  avatars={avatarArray || []}
                />
              ) : (
                <PrivateChatIcon />
              )}
            </View>
          )}
        </View>
        <View style={styles.chatName}>
          <Text numberOfLines={2} style={styles.chatDisplayName}>
            {chatDisplayName}
          </Text>
        </View>
        <View style={styles.sendIcon}>
          <SendIcon height={20} width={20} />
        </View>
      </TouchableOpacity>
      <Separator style={styles.itemSeparator} />
    </>
  );
};
