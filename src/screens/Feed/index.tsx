import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';

// import { useTranslation } from 'react-i18next';

import {
  FlatList,
  RefreshControl,
  View,
  ActivityIndicator,
} from 'react-native';
import PostList from '../../components/Social/PostList';
import { useStyles } from './styles';
import {
  CommunityRepository,
  PostRepository,
  SubscriptionLevels,
  UserRepository,
  getCommunityTopic,
  getUserTopic,
  subscribeTopic,
} from '@amityco/ts-sdk-react-native';
import type { FeedRefType } from '../CommunityHome';
import { deletePostById } from '../../providers/Social/feed-sdk';
import { amityPostsFormatter } from '../../util/postDataFormatter';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import feedSlice from '../../redux/slices/feedSlice';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
import useAuth from '../../hooks/useAuth';

interface IFeed {
  targetId: string;
  targetType: string;
  selectedChapterName?: string;
}
interface ICommunityItems {
  communityId: string;
  avatarFileId: string;
  displayName: string;
  isPublic: boolean;
  isOfficial: boolean;
}

function Feed({ targetId, targetType }: IFeed, ref: React.Ref<FeedRefType>) {
  const styles = useStyles();
  const theme = useTheme() as MyMD3Theme;
  const [postData, setPostData] =
    useState<Amity.LiveCollection<Amity.Post<any>>>();
  const [communityItems, setCommunityItems] = useState<ICommunityItems[]>([]);
  const [communityIds, setCommunityIds] = useState<string[]>([]);
  const { postList } = useSelector((state: RootState) => state.feed);
  const { clearFeed, updateFeed, deleteByPostId } = feedSlice.actions;
  const [refreshing, setRefreshing] = useState(false);
  const { data: posts, onNextPage, hasNextPage } = postData ?? {};
  const [loading, setLoading] = useState(false);
  const [unSubFunc, setUnSubPageFunc] = useState<() => void>();
  const { client }: any = useAuth();
  const accessToken = client?.token?.accessToken;
  const dispatch = useDispatch();

  const queryCommunities = async () => {
    const unsubscribe = CommunityRepository.getCommunities(
      { tags: ['chapter', 'force-array-query-param'], limit: 100 },
      async ({ data }) => {
        const formattedData: ICommunityItems[] = data.map(
          (item: Amity.Community) => {
            return {
              communityId: item.communityId as string,
              avatarFileId: item.avatarFileId as string,
              displayName: item.displayName as string,
              isPublic: item.isPublic as boolean,
              isOfficial: item.isOfficial as boolean,
            };
          }
        );
        const extractedCommunityIds = extractCommunityIds(formattedData);
        setCommunityIds(extractedCommunityIds);
        setCommunityItems(formattedData);
      }
    );
    unsubscribe();
  };

  function extractCommunityIds(data) {
    return data.map((item) => item.communityId);
  }

  const fetchAllChaptersPostId = () => {
    fetch('https://beta.amity.services/search/v2/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: {
          targetId: communityIds,
          targetType: 'community',
        },
        sort: [{ createdAt: { order: 'desc' } }],
        from: 0,
        size: 500,
        populatePostObject: true,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        return amityPostsFormatter(data?.objects?.posts);
      })
      .then((formattedPostList) => {
        dispatch(updateFeed(formattedPostList));
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data one:', error);
        fetchAllChaptersPostId();
      });
  };

  // const fetchPostDetail = (postIds) => {
  //   const searchParams = postIds.reduce((acc, p) => {
  //     acc.append("postIds", p);
  //     return acc;
  //   }, new URLSearchParams());

  //   fetch(`https://api.us.amity.co/api/v3/posts/list?${searchParams}`, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${accessToken}`
  //     },
  //   })
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //       return response.json();
  //     })
  //     .then(data => {
  //       return amityPostsFormatter(data?.posts);
  //     })
  //     .then(formattedPostList => {
  //       const invertedList = formattedPostList.reverse();
  //       dispatch(updateFeed(invertedList));
  //       setLoading(false);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching data two:', error);
  //     });
  // };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      queryCommunities();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (targetId === '' && communityIds?.length > 0) {
        setLoading(true);
        fetchAllChaptersPostId();
      }
    }, [targetId, communityIds])
  );

  const disposers: Amity.Unsubscriber[] = [];
  let isSubscribed = false;

  const subscribePostTopic = useCallback((type: string, id: string) => {
    if (isSubscribed) return;

    if (type === 'user') {
      let user = {} as Amity.User; // use getUser to get user by targetId
      UserRepository.getUser(id, ({ data }) => {
        user = data;
      });
      disposers.push(
        subscribeTopic(getUserTopic(user, SubscriptionLevels.POST), () => {
          // use callback to handle errors with event subscription
        })
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
      isSubscribed = true;
      return;
    }

    if (type === 'community') {
      CommunityRepository.getCommunity(id, (data) => {
        if (data.data) {
          if (data?.data?.postsCount === 0) {
            setLoading(false);
          }
          subscribeTopic(getCommunityTopic(data.data, SubscriptionLevels.POST));
        }
      });
    }
  }, []);

  const getFeed = useCallback(() => {
    const unsubscribe = PostRepository.getPosts(
      {
        targetId,
        targetType,
        sortBy: 'lastCreated',
        limit: 10,
        feedType: 'published',
      },
      (data) => {
        setPostData(data);
        subscribePostTopic(targetType, targetId);
      }
    );
    setUnSubPageFunc(() => unsubscribe());
  }, [subscribePostTopic, targetId, targetType]);

  const handleLoadMore = () => {
    if (hasNextPage && targetId !== '') {
      onNextPage && onNextPage();
    }
  };

  const onRefresh = useCallback(() => {
    if (targetId !== '') {
      setRefreshing(true);
      dispatch(clearFeed());
      getFeed();
      setRefreshing(false);
    } else if (targetId === '') {
      setRefreshing(true);
      dispatch(clearFeed());
      queryCommunities();
      setRefreshing(false);
    }
  }, [clearFeed, dispatch, getFeed]);

  useFocusEffect(
    useCallback(() => {
      if (targetId !== '') {
        setLoading(true);
        getFeed();
      }
      return () => {
        unSubFunc && unSubFunc();
        dispatch(clearFeed());
      };
    }, [clearFeed, targetId, dispatch, getFeed, unSubFunc])
  );

  const getPostList = useCallback(async () => {
    if (posts.length > 0 && targetId !== '') {
      const formattedPostList = await amityPostsFormatter(posts);
      dispatch(updateFeed(formattedPostList));
      setLoading(false);
    }
  }, [dispatch, posts, updateFeed]);

  useFocusEffect(
    useCallback(() => {
      posts && getPostList();
    }, [posts, getPostList])
  );

  useImperativeHandle(ref, () => ({
    handleLoadMore,
  }));

  const onDeletePost = async (postId: string) => {
    const isDeleted = await deletePostById(postId);
    if (isDeleted) {
      dispatch(deleteByPostId({ postId }));
    }
  };

  function getFeedChapterName(targetId: string) {
    let chapterName = '';
    const chapterObj = communityItems.find(
      (item) => item.communityId === targetId
    );
    if (chapterObj) {
      chapterName = chapterObj.displayName;
    }
    return chapterName;
  }

  return (
    <View
      style={[
        styles.feedWrap,
        {
          backgroundColor: loading
            ? 'rgba(255, 255, 255, .75)'
            : theme.colors.baseShade4,
        },
      ]}
    >
      <FlatList
        data={postList}
        renderItem={({ item, index }) => (
          <PostList
            onDelete={onDeletePost}
            postDetail={item}
            isGlobalfeed={false}
            postIndex={index}
            showBackBtn={true}
            chapterName={getFeedChapterName(item.targetId)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['lightblue']}
            tintColor="lightblue"
          />
        }
        keyExtractor={(_, index) => index.toString()}
        extraData={postList}
      />
      {loading ? (
        <View style={styles.activityIndicator}>
          <ActivityIndicator color={theme.colors.baseShade1} />
        </View>
      ) : null}
    </View>
  );
}
export default forwardRef(Feed);
