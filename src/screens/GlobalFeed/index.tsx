import React, { useCallback, useRef, useState } from 'react';
// import moment from 'moment-timezone';
// import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import {
  deletePostById,
  getGlobalFeed,
  type IGlobalFeedRes,
} from '../../providers/Social/feed-sdk';
import useAuth from '../../hooks/useAuth';
import PostList from '../../components/Social/PostList';
import { useStyle } from './styles';
// import MyCommunity from '../../components/MyCommunity';
import { amityPostsFormatter } from '../../util/postDataFormatter';
import { useDispatch, useSelector } from 'react-redux';
import globalFeedSlice from '../../redux/slices/globalfeedSlice';
import { RootState } from '../../redux/store';
// import useConfig from '../../hooks/useConfig';
// import { ComponentID } from '../../util/enumUIKitID';
import { useFocusEffect } from '@react-navigation/native';
import { RefreshControl } from 'react-native';

export default function GlobalFeed() {
  const { postList } = useSelector((state: RootState) => state.globalFeed);
  const [refreshing, setRefreshing] = useState(false);
  // const { excludes } = useConfig();
  const { updateGlobalFeed, deleteByPostId, clearFeed } =
    globalFeedSlice.actions;
  const dispatch = useDispatch();
  const styles = useStyle();
  const { isConnected } = useAuth();
  const [postData, setPostData] = useState<IGlobalFeedRes>();
  const { data: posts = [], nextPage } = postData ?? {};
  const flatListRef = useRef(null);
  async function getGlobalFeedList(
    page: Amity.Page<number> = { after: 0, limit: 8 }
  ): Promise<void> {
    const feedObject = await getGlobalFeed(page);
    if (feedObject) {
      setPostData(feedObject);
    }
  }
  const handleLoadMore = () => {
    if (nextPage) {
      getGlobalFeedList(nextPage);
    }
  };
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    dispatch(clearFeed());
    await getGlobalFeedList();
    setRefreshing(false);
  }, [clearFeed, dispatch]);

  useFocusEffect(
    useCallback(() => {
      if (isConnected) {
        getGlobalFeedList();
      }
    }, [isConnected])
  );
  const getPostList = useCallback(async () => {
    if (posts.length > 0) {
      const formattedPostList = await amityPostsFormatter(posts);
      dispatch(updateGlobalFeed(formattedPostList));
    }
  }, [dispatch, posts, updateGlobalFeed]);
  useFocusEffect(
    useCallback(() => {
      posts && getPostList();
    }, [getPostList, posts])
  );

  const onDeletePost = async (postId: string) => {
    const isDeleted = await deletePostById(postId);
    if (isDeleted) {
      dispatch(deleteByPostId({ postId }));
    }
  };

  // const formatedPostList = useMemo(() => {
  //   console.log('BEFORE::', JSON.stringify(postList));
  //   // To sorted the post by createdAt
  //   const newArr = postList.map((item) => item);
  //   const res = newArr.sort((a, b) => {
  //     const dateA = moment(new Date(a.createdAt))
  //       .tz(moment.tz.guess())
  //       .format();
  //     const dateB = moment(new Date(b.createdAt))
  //       .tz(moment.tz.guess())
  //       .format();
  //     return moment(dateB).diff(moment(dateA));
  //   });
  //   console.log('AFTER::', JSON.stringify(res));
  //   return res;
  // }, [postList]);

  // console.log("AFTER post::", JSON.stringify(postList))

  return (
    <View style={styles.feedWrap}>
      <View style={styles.feedWrap}>
        <FlatList
          data={postList}
          renderItem={({ item, index }) => (
            <PostList
              onDelete={onDeletePost}
              postDetail={item}
              postIndex={index}
              showBackBtn={true}
            />
          )}
          keyExtractor={(item) => item.postId.toString()}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          ref={flatListRef}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['lightblue']}
              tintColor="lightblue"
            />
          }
          extraData={postList}
          // ListHeaderComponent={
          //   excludes.includes(ComponentID.StoryTab) && <MyCommunity />
          // }
        />
      </View>
    </View>
  );
}
