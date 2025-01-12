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
import { Client } from '@amityco/ts-sdk-react-native';
import { deletePostById } from '../../providers/Social/feed-sdk';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import feedSlice from '../../redux/slices/feedSlice';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
import { useFocusEffect } from '@react-navigation/native';
import { decode } from 'js-base64';
import { getAmityUser } from '../../providers/user-provider';
import { UserInterface } from '../../types';
import { FeedRefType } from '~/screens/CommunityHome';
import { SocialContext } from '../../store/context';
// @ts-ignore
import { screens } from '../../../../../src/constants/screens';

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

interface IFeed {
  targetIds: string[];
  targetType: string;
  selectedChapterName?: string;
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

function Feed({ targetIds, targetType }: IFeed, ref: React.Ref<FeedRefType>) {
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
  const flatlistRef = useRef<FlatList | null>(null);
  const { scrollFeedToTop, setScrollFeedToTop, screen } = useContext(SocialContext)

  useEffect(() => {
    if (flatlistRef.current && scrollFeedToTop && postList?.length > 0) {
      flatlistRef.current.scrollToIndex({ index: 0, animated: true });
      setScrollFeedToTop?.(false);
      onRefresh?.(false);
    }
  }, [scrollFeedToTop])

  const fetchPostsFor = async (
    targetId: string,
    pagination?: Partial<ChapterPagination>
  ) => {
    if (pagination && !(pagination.first || pagination.last)) {
      console.debug(
        'Got pagination without first or last cursors: nothing to do'
      );

      return {
        targetId,
        data: [] as unknown as PostResponse,
      };
    }

    const response = await Client.getActiveClient().http.get('/api/v4/posts', {
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
    });

    return {
      targetId,
      data: response.data as PostResponse,
    };
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

      const paging = data.paging.next
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

  useFocusEffect(
    useCallback(() => {
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

      Promise.all(targetIds.map((targetId) => fetchPostsFor(targetId)))
        .then((response) => mapPostResponse(response, PostLoadType.INITIAL))
        .then(({ posts, allChapterPaginationByTargetId }) => {
          setChapterPaginationByTargetId(allChapterPaginationByTargetId);

          if (posts.length) {
            console.debug(
              `Will dispatch initial feed update of ${posts.length} posts`
            );
            dispatch(mergeFeed(posts));
          }
          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
          console.error(`Error fetching posts for ${targetIds}:`, e);
        });

      return () => {
        dispatch(clearFeed());
      };
    }, [
      targetIds.length === 1 ? targetIds[0] : targetIds.length,
      targetType,
      dispatch,
      mergeFeed,
      clearFeed,
    ])
  );

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

        return fetchPostsFor(targetId, morePostsChapterPagination);
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

        return fetchPostsFor(targetId, newerPostsChapterPagination);
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

  useEffect(() => {
    const intervalId = setInterval(
      () => onRefresh(false),
      AUTO_FEED_REFRESH_PERIOD_MS
    );

    return () => clearInterval(intervalId);
  }, []);

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
        ref={flatlistRef}
        data={postList}
        renderItem={({ item, index }) => (
          <PostList
            onDelete={onDeletePost}
            postDetail={item}
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
      {loading ? (
        <View style={styles.activityIndicator}>
          <ActivityIndicator color={theme.colors.baseShade1} />
        </View>
      ) : null}
    </View>
  );
}

export default forwardRef(Feed);