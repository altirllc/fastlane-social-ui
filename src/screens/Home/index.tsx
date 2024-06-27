/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { LogBox, Text, TouchableOpacity, View } from 'react-native';
import useAuth from '../../hooks/useAuth';
import Feed from '../../screens/Feed/index';
import { useStyles } from './styles';
import { Icon } from 'react-native-paper';
import { TabName } from '../../enum/tabNameState';
import {
  DrawerActions,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
// import uiSlice from '../../redux/slices/uiSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getShadowProps } from '../../theme/helpers';
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { PlusIcon } from '../../svg/PlusIcon';
// @ts-ignore
import { Avatar } from '../../../../../src/components/Avatar/Avatar';
// @ts-ignore
import { screens } from '../../../../../src/constants/screens';
import { SideBarIcon } from '../../svg/Sidebar';
import { ChevronDownIcon } from '../../svg/ChevronDown';
import { SocialContext } from '../../store/context';
// @ts-ignore
import { CompleteProfileCard } from '../../../../../src/components/CompleteProfileCard/CompleteProfileCard';
import { ChannelRepository, Client } from '@amityco/ts-sdk-react-native';
import { RootState } from '~/redux/store';
import chaptersSlice from '../../redux/slices/chapters';
import { FeedTargetType } from '../../constants';
import postDetailSlice from '../../../src/redux/slices/postDetailSlice';
import { getAmityUser } from '../../providers/user-provider';
import { UserInterface } from '../../types';

LogBox.ignoreAllLogs(true);
export default function Home({
  selectedChapterId,
  selectedChapterName,
  // defaultChapterId,
  socialNavigation,
  avatarUrl,
  stepsCompleted,
  postId,
}: {
  selectedChapterId: string;
  selectedChapterName: string;
  defaultChapterId: string;
  socialNavigation: any;
  avatarUrl: string;
  stepsCompleted: number;
  postId: string;
}) {
  const styles = useStyles();
  const { client, isConnected } = useAuth();
  const dispatch = useDispatch();
  // const { openPostTypeChoiceModal } = uiSlice.actions;
  // const { excludes } = useConfig();
  const [activeTab] = useState<string>(TabName.NewsFeed);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useCustomTheme();
  const isFocused = useIsFocused();
  const {
    onDropdownClick,
    screen,
    setIsTabBarVisible,
    showCompleteProfileCard,
  } = useContext(SocialContext);
  const { setChapters } = chaptersSlice.actions;
  const { chapters } = useSelector((state: RootState) => state.chapters);
  const { updatePostDetail } = postDetailSlice.actions;

  const onClickSearch = () => {
    navigation.navigate('CommunitySearch');
  };
  const onClickAddCommunity = () => {
    navigation.navigate('CreateCommunity');
  };
  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        activeTab === TabName.MyCommunities ? (
          <TouchableOpacity
            onPress={onClickAddCommunity}
            style={styles.btnWrap}
          >
            {/* <SvgXml xml={plusIcon(theme.colors.base)} width="25" height="25" /> */}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onClickSearch} style={styles.btnWrap}>
            {/* <SvgXml
              xml={searchIcon(theme.colors.base)}
              width="25"
              height="25"
            /> */}
          </TouchableOpacity>
        ),
      headerTitle: '',
    });
  }, []);

  const openModal = () => {
    navigation.navigate('CreatePost', {
      userId: (client as Amity.Client).userId as string,
    });
    // dispatch(
    //   openPostTypeChoiceModal({
    //     userId: (client as Amity.Client).userId as string,
    //   })
    // );
  };

  useLayoutEffect(() => {
    //IMP: Don't remove setTimeout as this is used for showing footer on the screen.
    setTimeout(() => {
      if (isFocused) {
        setIsTabBarVisible?.(true);
      }
    }, 500);
  }, [isFocused]);

  useEffect(() => {
    (async () => {
      if (!postId) return;
      const response = await Client.getActiveClient().http.get(`/api/v3/posts/${postId}`, {
        params: {
          postId: postId,
        },
      });
      console.log("API response for post postId New v4 api", JSON.stringify(response.data));
      if (response?.data?.posts?.length > 0) {
        const post = response?.data?.posts[0];
        const { userObject } = await getAmityUser(post.postedUserId);
        let postDetail = {
          postId: post.postId,
          data: post.data as Record<string, any>,
          dataType: post.dataType,
          myReactions: post.myReactions as string[],
          reactionCount: post.reactions as Record<string, number>,
          commentsCount: post.commentsCount,
          user: userObject.data as UserInterface,
          editedAt: post.editedAt,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          targetType: post.targetType,
          targetId: post.targetId,
          childrenPosts: post.children,
          mentionees: post.mentionees[0]?.userIds,
          mentionPosition: post?.metadata?.mentioned || undefined,
        }
        dispatch(
          updatePostDetail({
            ...postDetail
          })
        );
        navigation.navigate('PostDetail', {
          postId: postDetail.postId,
          postIndex: null, //pass it as null as we don't have complete postlist to fetch index from.
          isFromGlobalfeed: false,
        });
      }

    })()
  }, [postId])

  useEffect(() => {
    const fetchChapters = async () => {
      const { data } = await Client.getActiveClient().http.get(
        '/api/v3/communities',
        {
          params: {
            'isDeleted': false,
            'options[limit]': 100,
            'tags[0]': 'chapter',
          },
        }
      );

      const chapters = data.communities as Amity.Community[];
      console.debug(
        `Fetched all chapters: ${JSON.stringify(
          chapters.map((c) => ({
            id: c.communityId,
            name: c.displayName,
          }))
        )}`
      );

      return chapters;
    };

    fetchChapters()
      .then((cc) => dispatch(setChapters(cc)))
      .catch((e) => console.error('Error fetching chapters', e));
  }, [dispatch]);

  const onQueryChannel = () => {
    ChannelRepository.getChannels(
      {
        sortBy: 'lastActivity',
        limit: 15,
        membership: 'member',
        isDeleted: false,
      },
      () => { }
    );
  };

  useEffect(() => {
    onQueryChannel();
  }, [isConnected]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.welcomeContainer,
          { backgroundColor: colors.secondary.main },
        ]}
      >
        <View>
          <TouchableOpacity
            onPress={() => {
              socialNavigation.dispatch(DrawerActions.openDrawer());
            }}
          >
            <SideBarIcon height={30} width={30} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.titleContainer}
          onPress={() => onDropdownClick(selectedChapterId)}
          disabled={screen === screens.MarketPlace}
        >
          <Text
            style={[
              styles.chapterName,
              { fontSize: screen === screens.MarketPlace ? 24 : 18 },
            ]}
          >
            {selectedChapterName}
          </Text>
          {screen === screens.Home && selectedChapterName ? (
            <View style={styles.chevronDownIcon}>
              <ChevronDownIcon height={17} width={17} />
            </View>
          ) : null}
        </TouchableOpacity>
        <View>
          <Avatar
            image={avatarUrl}
            size={40}
            onPress={() => {
              socialNavigation.navigate(screens.Profile);
            }}
            light={true}
            shadow
            disabled={showCompleteProfileCard}
          />
        </View>
      </View>
      {showCompleteProfileCard ? (
        <View style={[styles.cardContainer]}>
          <CompleteProfileCard
            onPress={() => {
              socialNavigation.navigate(screens.CompleteProfile);
            }}
            stepsCompleted={stepsCompleted}
          />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Feed
          targetIds={
            selectedChapterId
              ? [selectedChapterId]
              : chapters.map((c) => c.communityId)
          }
          targetType={FeedTargetType.COMMUNITY}
          selectedChapterName={selectedChapterName}
        />
      </View>

      <TouchableOpacity
        onPress={openModal}
        style={[
          showCompleteProfileCard
            ? styles.createFeedButton
            : styles.createFeedButtonWithoutProfileComplete,
          {
            ...getShadowProps({ color: colors.secondary.main }),
            backgroundColor: colors.primary.main,
          },
        ]}
      >
        <Icon source={PlusIcon} size={'xs'} color="transparent" />
      </TouchableOpacity>
    </View>
  );
}
