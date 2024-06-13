import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

// import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';
import PostList, { IPost } from '../../components/Social/PostList';
import { useStyles } from './styles';
import { Client, PostRepository } from '@amityco/ts-sdk-react-native';
import { deletePostById } from '../../providers/Social/feed-sdk';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import feedSlice from '../../redux/slices/feedSlice';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { decode } from 'js-base64';
import { getAmityUser } from '../../providers/user-provider';
import { UserInterface } from '../../types';
import { FeedRefType } from '~/screens/CommunityHome';
// @ts-ignore
import { screens } from '../../../../../src/constants/screens';
import { FeedTargetType } from '../../constants';
// @ts-ignore
import { Typography } from '../../../../../src/components/Typography/Typography';
import { t } from 'i18next';
import { SocialContext } from '../../../src/store/context';
import postDetailSlice from '../../redux/slices/postDetailSlice';

enum PostLoadType {
  INITIAL,
  NEW,
  MORE,
}

interface PostResponse {
  posts: Amity.InternalPost[];
  postChildren: Amity.InternalPost[];
  communities: Amity.RawCommunity[];
  communityUsers: Amity.RawMembership<'community'>[];
  categories: Amity.InternalCategory[];
  comments: Amity.InternalComment[];
  users: Amity.InternalUser[];
  files: Amity.File[];
  paging?: {
    previous?: string;
    next?: string;
  };
}

interface LastCreatedPostPaging {
  before: string;
  limit: number;
}

interface ChapterPagination {
  first: string;
  last: string;
  limit: number;
}

export interface IFeed {
  targetIds: string[];
  targetType: FeedTargetType;
  selectedChapterName?: string;
  postIdProp?: string;
}

const formatPosts = (
  posts: Amity.InternalPost,
  posterInfoById: Map<string, UserInterface>
): IPost[] =>
  posts.map((post) => ({
    postId: post.postId,
    data: post.data as Record<string, any>,
    dataType: post.dataType,
    myReactions: post.myReactions as string[],
    reactionCount: post.reactions as Record<string, number>,
    commentsCount: post.commentsCount,
    user: posterInfoById.get(post.postedUserId),
    editedAt: post.editedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    targetType: post.targetType,
    targetId: post.targetId,
    childrenPosts: post.children,
    mentionees: post.mentionees[0]?.userIds,
    mentionPosition: post?.metadata?.mentioned || undefined,
  }));

const ALL_CHAPTERS_PAGE_SIZE = 4;
const SINGLE_CHAPTER_PAGE_SIZE = 20;
const AUTO_FEED_REFRESH_PERIOD_MS = 60_000;

function Feed({ targetIds, targetType, postIdProp }: IFeed, ref: React.Ref<FeedRefType>) {
  const styles = useStyles();
  const theme = useTheme() as MyMD3Theme;
  const { postList } = useSelector((state: RootState) => state.feed);
  const { chapterById } = useSelector((state: RootState) => state.chapters);
  const { clearFeed, mergeFeed, deleteByPostId } = feedSlice.actions;
  const [refreshing, setRefreshing] = useState(false);
  const [chapterPaginationByTargetId, setChapterPaginationByTargetId] =
    useState<Map<string, ChapterPagination | undefined>>(new Map());
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const targetIdsDep = targetIds.length === 1 ? targetIds[0] : targetIds.length;
  const flatlistRef = useRef<FlatList | null>(null);
  const { scrollFeedToTop, setScrollFeedToTop, screen } = useContext(SocialContext)

  const [postId, setPostId] = useState('');
  const { updatePostDetail } = postDetailSlice.actions;
  const navigation = useNavigation<any>();

  useEffect(() => {
    setPostId(postIdProp)
  }, [postIdProp])

  useEffect(() => {
    if (flatlistRef.current && scrollFeedToTop) {
      flatlistRef.current.scrollToIndex({ index: 0, animated: true });
      setScrollFeedToTop?.(false);
      onRefresh?.(false);
    }
  }, [scrollFeedToTop])

  const fetchPostsFor = async (
    targetId: string,
    targetType: FeedTargetType,
    pagination?: Partial<ChapterPagination>
  ): Promise<{ targetId: string; data: PostResponse }> => {
    if (pagination && !(pagination.first || pagination.last)) {
      console.debug(
        'Got pagination without first or last cursors: nothing to do'
      );

      return {
        targetId,
        data: [] as unknown as PostResponse,
      };
    }

    switch (targetType) {
      case FeedTargetType.COMMUNITY: {
        const response = await Client.getActiveClient().http.get(
          '/api/v4/posts',
          {
            params: {
              targetId,
              targetType,
              'sortBy': 'lastCreated',
              'isDeleted': false,
              'options[limit]':
                pagination?.limit ?? targetIds.length > 1
                  ? ALL_CHAPTERS_PAGE_SIZE
                  : SINGLE_CHAPTER_PAGE_SIZE,
              'feedType': 'published',
              ...(pagination?.first && { 'options[after]': pagination.first }),
              ...(pagination?.last && { 'options[before]': pagination.last }),
            },
          }
        );

        return {
          targetId,
          data: response.data as PostResponse,
        };
      }
      case FeedTargetType.USER: {
        const response = await (
          await fetch('https://beta.amity.services/search/v2/posts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Client.getActiveClient().token.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              populatePostObject: true,
              query: {
                targetId: Object.keys(chapterById),
                targetType: 'community',
                postedUserId: targetId,
              },
              sort: [
                {
                  createdAt: 'desc',
                },
              ],
              size: SINGLE_CHAPTER_PAGE_SIZE,
            }),
          })
        ).json();

        return {
          targetId,
          data: response.objects as PostResponse,
        };
      }
    }
  };

  const mapPostResponse = async (
    response: Array<{
      targetId: string;
      data: PostResponse;
    }>,
    loadType: PostLoadType
  ) => {
    const posts: Amity.InternalPost[] = [];
    const allChapterPaginationByTargetId = new Map(chapterPaginationByTargetId);
    for (const { targetId, data } of response) {
      if (!(data.posts && data.posts.length)) {
        console.debug(`No posts to map in response from ${targetId}`);

        continue;
      }

      const paging = data.paging?.next
        ? (JSON.parse(decode(data.paging.next)) as LastCreatedPostPaging)
        : undefined;
      console.debug(`Paging for ${targetId}:`, paging);

      const previousChapterPagination = chapterPaginationByTargetId.get(
        targetId
      ) as ChapterPagination | undefined;

      const chapterPagination = {
        first:
          PostLoadType.MORE !== loadType
            ? data.posts[0].postId
            : previousChapterPagination?.first,
        last:
          PostLoadType.NEW !== loadType
            ? paging?.before
            : previousChapterPagination?.last,
        limit: paging?.limit,
      };
      console.debug(`Chapter pagination for ${targetId}`, chapterPagination);

      allChapterPaginationByTargetId.set(targetId, chapterPagination);

      posts.push(...data.posts);
    }

    const posters = new Set<string>(posts.map((p) => p.postedUserId));
    const posterInfo = await Promise.all(
      Array.from(posters).map(async (u) => {
        const { userObject } = await getAmityUser(u);

        return userObject.data as UserInterface;
      })
    );
    const posterInfoById = posterInfo.reduce((acc, u) => {
      acc.set(u.userId, u);

      return acc;
    }, new Map<string, UserInterface>());

    return {
      posts: formatPosts(posts, posterInfoById),
      allChapterPaginationByTargetId,
    };
  };

  useEffect(() => {
    (async () => {
      if (!postId) return;
      try {
        //if we have postId from route, that means we need to navigate to post detail for that post
        //when user click on some post in the chats, we need to fetch the post and navigate user to post detail
        setLoading(true);
        PostRepository.getPost(postId, ({ data }) => {
          dispatch(
            updatePostDetail(data)
          );
          navigation.navigate('PostDetail', {
            postId: data.postId,
            postIndex: null,
            isFromGlobalfeed: false,
          });
        });
      } catch (e) {
        console.log("error", e)
      } finally {
        setLoading(false);
      }
    })()
  }, [postId])

  useEffect(() => {
    if (postId) return () => { };
    console.debug(`Will fetch initial posts from [${targetIds}]`);

    if (!targetIds.length) {
      console.debug('No post targets specified: nothing to do');

      return () => { };
    }

    if (loading) {
      console.debug('Already loading: will not send concurrent request');

      return () => { };
    }

    setLoading(true);

    Promise.all(
      targetIds.map((targetId) => fetchPostsFor(targetId, targetType))
    )
      .then((response) => mapPostResponse(response, PostLoadType.INITIAL))
      .then(({ posts, allChapterPaginationByTargetId }) => {
        setChapterPaginationByTargetId(allChapterPaginationByTargetId);

        if (posts.length) {
          console.debug(
            `Will dispatch initial feed update of ${posts.length} posts for [${targetIds}]`
          );
          dispatch(mergeFeed(posts));
        }
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        console.error(`Error fetching posts for [${targetIds}]:`, e);
      });

    return () => {
      console.debug(`Will cleanup posts for [${targetIds}]`);

      dispatch(clearFeed());
    };
  }, [targetIdsDep, targetType, postId])

  // useFocusEffect(
  //   useCallback(() => {
  //     console.debug(`Will fetch initial posts from [${targetIds}]`);

  //   if (!targetIds.length) {
  //     console.debug('No post targets specified: nothing to do');

  //     return () => { };
  //   }

  //   if (loading) {
  //     console.debug('Already loading: will not send concurrent request');

  //     return () => { };
  //   }

  //   setLoading(true);

  //   Promise.all(
  //     targetIds.map((targetId) => fetchPostsFor(targetId, targetType))
  //   )
  //     .then((response) => mapPostResponse(response, PostLoadType.INITIAL))
  //     .then(({ posts, allChapterPaginationByTargetId }) => {
  //       setChapterPaginationByTargetId(allChapterPaginationByTargetId);

  //       if (posts.length) {
  //         console.debug(
  //           `Will dispatch initial feed update of ${posts.length} posts for [${targetIds}]`
  //         );
  //         dispatch(mergeFeed(posts));
  //       }
  //       setLoading(false);
  //     })
  //     .catch((e) => {
  //       setLoading(false);
  //       console.error(`Error fetching posts for [${targetIds}]:`, e);
  //     });

  //   return () => {
  //     console.debug(`Will cleanup posts for [${targetIds}]`);

  //     dispatch(clearFeed());
  //   };
  //   }, [targetIdsDep, targetType])
  // );

  const handleLoadMore = () => {
    console.debug(`Got request to load more posts for [${targetIds}]`);
    setLoading(true);

    Promise.all(
      targetIds.map(async (targetId) => {
        const chapterPagination = chapterPaginationByTargetId.get(targetId);
        if (!chapterPagination) {
          return {
            targetId,
            data: [] as unknown as PostResponse,
          };
        }

        console.debug(`Will load more posts from ${targetId}`);
        const { first, ...morePostsChapterPagination } =
          chapterPaginationByTargetId.get(targetId);
        console.debug(
          `More posts pagination for ${targetId}`,
          morePostsChapterPagination
        );

        return fetchPostsFor(targetId, targetType, morePostsChapterPagination);
      })
    )
      .then((response) => mapPostResponse(response, PostLoadType.MORE))
      .then(({ posts, allChapterPaginationByTargetId }) => {
        setChapterPaginationByTargetId(allChapterPaginationByTargetId);

        if (posts.length) {
          console.debug(
            `Will dispatch feed update of ${posts.length} more posts`
          );
          dispatch(mergeFeed(posts));
        }
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        console.error(`Error loading more posts for [${targetIds}]:`, e);
      });
  };

  useImperativeHandle(ref, () => ({
    handleLoadMore,
  }));

  const onRefresh = (shouldRefresh: boolean) => {
    console.debug(`Got request to refresh posts for [${targetIds}]`);
    if (shouldRefresh) {
      setRefreshing(true);
    }

    Promise.all(
      targetIds.map(async (targetId) => {
        const chapterPagination = chapterPaginationByTargetId.get(targetId);
        if (!chapterPagination) {
          return {
            targetId,
            data: [] as unknown as PostResponse,
          };
        }

        console.debug(`Will load newer posts from ${targetId}`);
        const { last, ...newerPostsChapterPagination } = chapterPagination;
        console.debug(
          `Newer posts pagination for ${targetId}`,
          newerPostsChapterPagination
        );

        return fetchPostsFor(targetId, targetType, newerPostsChapterPagination);
      })
    )
      .then((response) => mapPostResponse(response, PostLoadType.NEW))
      .then(({ posts, allChapterPaginationByTargetId }) => {
        setChapterPaginationByTargetId(allChapterPaginationByTargetId);

        if (posts.length) {
          console.debug(
            `Will dispatch refresh feed update of ${posts.length} posts`
          );
          dispatch(mergeFeed(posts));
        }
        setRefreshing(false);
      })
      .catch((e) => {
        setRefreshing(false);
        console.error(`Error load newer posts for [${targetIds}]:`, e);
      });
  };

  const onDeletePost = async (postId: string) => {
    const isDeleted = await deletePostById(postId);
    if (isDeleted) {
      dispatch(deleteByPostId({ postId }));
    }
  };

  useFocusEffect(
    useCallback(() => {
      const intervalId = setInterval(
        () => onRefresh(false),
        AUTO_FEED_REFRESH_PERIOD_MS
      );

      return () => {
        console.debug(`Will stop automatic post refresh for [${targetIds}]`);

        clearInterval(intervalId);
      };
    }, [targetIdsDep, targetType])
  );

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
      {
        loading ? (
          <View style={styles.activityIndicator}>
            <ActivityIndicator color={theme.colors.baseShade1} />
          </View>
        ) : postList.length ? (
          <FlatList
            ref={flatlistRef}
            data={postList}
            renderItem={({ item, index }) => (
              <PostList
                onDelete={onDeletePost}
                postDetail={item}
                from='Feed'
                isGlobalfeed={false}
                postIndex={index}
                showBackBtn={true}
                chapterName={screen === screens.MarketPlace ? chapterById[item?.user?.metadata?.chapter?.id]?.displayName : chapterById[item.targetId]?.displayName}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => onRefresh(true)}
                colors={['lightblue']}
                tintColor="lightblue"
              />
            }
            keyExtractor={(item) => item.postId}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={2}
          />
        ) : targetIds.length ? (
          <View style={styles.emptyFeedContainer}>
            <Typography>{t('home.noPosts')}</Typography>
          </View>
        ) : null
      }
    </View >
  );
}

export default forwardRef(Feed);
