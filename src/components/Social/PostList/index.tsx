import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
// import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { personXml, threeDots } from '../../../svg/svg-xml-list';
import { useStyles } from './styles';
import type { UserInterface } from '../../../types/user.interface';
import {
  addPostReaction,
  isReportTarget,
  removePostReaction,
  reportTargetById,
  unReportTargetById,
} from '../../../providers/Social/feed-sdk';
import { getCommunityById } from '../../../providers/Social/communities-sdk';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useAuth from '../../../hooks/useAuth';
import EditPostModal from '../../../components/EditPostModal';
import MediaSection from '../../../components/MediaSection';
import postDetailSlice from '../../../redux/slices/postDetailSlice';
import { useDispatch } from 'react-redux';
import globalFeedSlice from '../../../redux/slices/globalfeedSlice';
import { IMentionPosition } from '../../../screens/CreatePost';
import feedSlice from '../../../redux/slices/feedSlice';
import RenderTextWithMention from './Components/RenderTextWithMention';
import { RootStackParamList } from '../../../routes/RouteParamList';
import { useTimeDifference } from '../../../hooks/useTimeDifference';
import BackButton from '../../BackButton';
import { SocialContext } from '../../../store/context';
import { HeartIcon } from '../../../svg/HeartIcon';
import { CommentIcon } from '../../../svg/CommentIcon';
import { useTheme } from 'react-native-paper';
import { MyMD3Theme } from '../../../../src/providers/amity-ui-kit-provider';
// @ts-ignore
import { SendIcon } from '../../../svg/SendIcon';

export interface IPost {
  postId: string;
  data: Record<string, any>;
  dataType: string | undefined;
  myReactions: string[];
  reactionCount: Record<string, number>;
  commentsCount: number;
  user: UserInterface | undefined;
  updatedAt: string | undefined;
  editedAt: string | undefined;
  createdAt: string;
  targetType: string;
  targetId: string;
  childrenPosts: string[];
  mentionees: string[];
  mentionPosition?: IMentionPosition[];
}
export interface IPostList {
  onDelete?: (postId: string) => void;
  onChange?: (postDetail: IPost) => void;
  postDetail: IPost;
  postIndex?: number;
  isGlobalfeed?: boolean;
  showBackBtn?: boolean;
  chapterName?: string;
}
export interface MediaUri {
  uri: string;
}
export interface IVideoPost {
  thumbnailFileId: string;
  videoFileId: {
    original: string;
  };
}
export default function PostList({
  postDetail,
  postIndex,
  onDelete,
  isGlobalfeed = true,
  showBackBtn = false,
  chapterName,
}: IPostList) {
  const { client, apiRegion } = useAuth();
  const styles = useStyles();
  const theme = useTheme() as MyMD3Theme;
  const [isLike, setIsLike] = useState<boolean>(false);
  const [likeReaction, setLikeReaction] = useState<number>(0);
  const [, setCommunityName] = useState('');
  const [textPost, setTextPost] = useState<string>('');
  const [privateCommunityId, setPrivateCommunityId] = useState(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isReportByMe, setIsReportByMe] = useState<boolean>(false);
  const [editPostModalVisible, setEditPostModalVisible] =
    useState<boolean>(false);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();

  const [mentionPositionArr, setMentionsPositionArr] = useState<
    IMentionPosition[]
  >([]);
  const { updateByPostId: updateByPostIdGlobalFeed } = globalFeedSlice.actions;
  const { updateByPostId } = feedSlice.actions;
  const { updatePostDetail } = postDetailSlice.actions;
  const {
    postId,
    data,
    myReactions = [],
    reactionCount,
    commentsCount,
    createdAt,
    user,
    targetType,
    targetId,
    childrenPosts = [],
    editedAt,
    mentionPosition,
  } = postDetail ?? {};
  const timeDifference = useTimeDifference(createdAt);
  const { onMemberClick } = useContext(SocialContext);

  useEffect(() => {
    if (mentionPosition) {
      setMentionsPositionArr(mentionPosition);
    }
  }, [mentionPosition]);

  useEffect(() => {
    if (myReactions && myReactions?.length > 0) {
      setIsLike(true);
    } else {
      setIsLike(false);
    }
    if (reactionCount?.like) {
      setLikeReaction(reactionCount?.like);
    } else {
      setLikeReaction(0);
    }
  }, [myReactions, reactionCount]);

  const openModal = () => {
    setIsVisible(true);
  };

  const closeModal = () => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  const checkIsReport = useCallback(async () => {
    const isReport = await isReportTarget('post', postId);
    if (isReport) {
      setIsReportByMe(true);
    }
  }, [postId]);

  useEffect(() => {
    checkIsReport();
  }, [checkIsReport]);

  useEffect(() => {
    setTextPost(data?.text);
    if (myReactions.length > 0 && myReactions.includes('like')) {
      setIsLike(true);
    }
    if (reactionCount?.like) {
      setLikeReaction(reactionCount?.like);
    }
    if (targetType === 'community' && targetId) {
      getCommunityInfo(targetId);
    }
  }, [data?.text, myReactions, reactionCount?.like, targetId, targetType]);

  // const renderLikeText = useCallback(
  //   (likeNumber: number | undefined): string => {
  //     if (!likeNumber) return '';
  //     if (likeNumber === 1) return 'like';
  //     return 'likes';
  //   },
  //   []
  // );
  // const renderCommentText = useCallback(
  //   (commentNumber: number | undefined): string => {
  //     if (!commentNumber) return '';
  //     if (commentNumber === 1) return 'comment';
  //     return 'comments';
  //   },
  //   []
  // );

  const addReactionToPost = useCallback(async () => {
    setIsLike((prev) => !prev);
    setLikeReaction((prev) => (prev ? prev - 1 : prev + 1));
    const updatedLikeReaction = isLike ? likeReaction - 1 : likeReaction + 1;
    const updatedPost = {
      ...postDetail,
      reactionCount: { like: updatedLikeReaction },
      myReactions: isLike ? [] : ['like'],
    };
    try {
      if (isGlobalfeed) {
        dispatch(
          updateByPostIdGlobalFeed({ postId: postId, postDetail: updatedPost })
        );
      } else {
        dispatch(updateByPostId({ postId: postId, postDetail: updatedPost }));
      }
      if (isLike) {
        await removePostReaction(postId, 'like');
      } else {
        await addPostReaction(postId, 'like');
      }
    } catch (error) {
      setLikeReaction((prev) => prev);
    }
  }, [
    dispatch,
    isGlobalfeed,
    isLike,
    likeReaction,
    postDetail,
    postId,
    updateByPostId,
    updateByPostIdGlobalFeed,
  ]);

  async function getCommunityInfo(id: string) {
    const { data: community }: { data: Amity.LiveObject<Amity.Community> } =
      await getCommunityById(id);
    setCommunityName(community.data.displayName);
    !community.data.isPublic &&
      setPrivateCommunityId(community.data.communityId);
  }

  function onClickComment() {
    dispatch(
      updatePostDetail({
        ...postDetail,
        myReactions: isLike ? ['like'] : [],
        reactionCount: { like: likeReaction },
        commentsCount: commentsCount,
      })
    );
    navigation.navigate('PostDetail', {
      postId: postDetail.postId,
      postIndex: postIndex,
      isFromGlobalfeed: isGlobalfeed,
    });
  }

  const onSendPress = () => {
    if (!postDetail.postId) return;
    navigation.navigate('MembersList', { postId: postDetail.postId });
  };

  const handleDisplayNamePress = () => {
    if (user?.userId) {
      onMemberClick?.(user.userId);
    }
  };

  // const handleCommunityNamePress = () => {
  //   if (targetType === 'community' && targetId) {
  //     navigation.navigate('CommunityHome', {
  //       communityId: targetId,
  //       communityName: communityName,
  //     });
  //   }
  // };
  const deletePostObject = () => {
    Alert.alert(
      'Delete this post',
      `This post will be permanently deleted. You'll no longer see and find this post`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete && onDelete(postId),
        },
      ]
    );
    setIsVisible(false);
  };
  const reportPostObject = async () => {
    if (isReportByMe) {
      const unReportPost = await unReportTargetById('post', postId);
      if (unReportPost) {
        Alert.alert('Undo Report sent');
      }
      setIsVisible(false);
      setIsReportByMe(false);
    } else {
      const reportPost = await reportTargetById('post', postId);
      if (reportPost) {
        Alert.alert('Report sent');
      }
      setIsVisible(false);
      setIsReportByMe(true);
    }
  };

  const modalStyle = {
    transform: [
      {
        translateY: slideAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [600, 0], // Adjust this value to control the sliding distance
        }),
      },
    ],
  };

  const renderOptionModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={closeModal}
      >
        <Pressable onPress={closeModal} style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              modalStyle,
              user?.userId === (client as Amity.Client).userId &&
                styles.twoOptions,
            ]}
          >
            {user?.userId === (client as Amity.Client).userId ? (
              <View>
                <TouchableOpacity
                  onPress={openEditPostModal}
                  style={styles.modalRow}
                >
                  <Text style={styles.deleteText}> Edit Post</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={deletePostObject}
                  style={styles.modalRow}
                >
                  <Text style={styles.deleteText}> Delete Post</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={reportPostObject}
                style={styles.modalRow}
              >
                <Text style={styles.deleteText}>
                  {isReportByMe ? 'Undo Report' : 'Report'}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </Pressable>
      </Modal>
    );
  };
  const closeEditPostModal = () => {
    setEditPostModalVisible(false);
  };
  const openEditPostModal = () => {
    setIsVisible(false);
    setEditPostModalVisible(true);
  };

  const handleOnFinishEdit = (postData: {
    text: string;
    mediaUrls: string[] | IVideoPost[];
  }) => {
    setTextPost(postData.text);
    setEditPostModalVisible(false);
    setIsEdit(true);
  };

  // const onClickReactions = useCallback(() => {
  //   navigation.navigate('ReactionList', {
  //     referenceId: postId,
  //     referenceType: 'post',
  //   });
  // }, [navigation, postId]);

  return (
    <View
      key={postId}
      style={[styles.postWrap, { marginTop: postIndex === 0 ? 8 : 0 }]}
    >
      <View style={styles.headerSection}>
        {showBackBtn ? null : (
          <View style={styles.backBtn}>
            <BackButton
              onPress={() => {
                console.log('back');
              }}
            />
          </View>
        )}
        <View style={styles.user}>
          <TouchableOpacity
            style={styles.displayNameContainer}
            onPress={handleDisplayNamePress}
          >
            {user?.avatarFileId ? (
              <Image
                style={styles.avatar}
                source={{
                  uri: `https://api.${apiRegion}.amity.co/api/v3/files/${user?.avatarFileId}/download`,
                }}
              />
            ) : (
              <View style={styles.avatar}>
                <SvgXml xml={personXml} width="20" height="16" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.fillSpace}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={handleDisplayNamePress}>
                <Text style={styles.headerText}>{user?.displayName}</Text>
              </TouchableOpacity>
            </View>
            {chapterName && (
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={styles.chapterNameText}
              >
                {chapterName}
              </Text>
            )}
            <View style={styles.timeRow}>
              <Text style={styles.headerTextTime}>{timeDifference}</Text>
              {(editedAt !== createdAt || isEdit) && (
                <Text style={styles.dot}>·</Text>
              )}
              {(editedAt !== createdAt || isEdit) && (
                <Text style={styles.headerTextTime}>Edited</Text>
              )}
            </View>
          </View>
        </View>
        {user?.userId === (client as Amity.Client).userId ? (
          <TouchableOpacity onPress={openModal} style={styles.threeDots}>
            <SvgXml xml={threeDots(theme.colors.base)} width="20" height="16" />
          </TouchableOpacity>
        ) : null}
      </View>
      <View>
        <View style={styles.bodySection}>
          {textPost && (
            <RenderTextWithMention
              mentionPositionArr={[...mentionPositionArr]}
              textPost={textPost}
            />
          )}
          {childrenPosts?.length > 0 && (
            <MediaSection childrenPosts={childrenPosts} />
          )}
        </View>

        {/* {likeReaction === 0 && commentsCount === 0 ? (
          ''
        ) : (
          <View>
            <View style={styles.countSection}>
              {likeReaction ? (
                <Text style={styles.likeCountText} onPress={onClickReactions}>
                  {likeReaction} {renderLikeText(likeReaction)}
                </Text>
              ) : (
                <Text />
              )}
              {commentsCount > 0 && (
                <Text style={styles.commentCountText}>
                  {commentsCount > 0 && commentsCount}{' '}
                  {renderCommentText(commentsCount)}
                </Text>
              )}
            </View>
          </View>
        )} */}

        <View style={styles.actionSection}>
          <TouchableOpacity onPress={addReactionToPost} style={styles.likeBtn}>
            <HeartIcon
              width={18}
              height={18}
              color={isLike ? '#FF3830' : '#FFFFFF'}
              stroke={isLike ? '#FF3830' : '#14151A'}
            />
            <Text style={isLike ? styles.likedText : styles.btnText}>
              {' '}
              {likeReaction}{' '}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClickComment} style={styles.commentBtn}>
            <CommentIcon width={17} height={17} />
            <Text style={[styles.btnText]}>{commentsCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendIcon} onPress={onSendPress}>
            <SendIcon strokeColor={'#14151A'} width={17} height={17} />
          </TouchableOpacity>
        </View>
      </View>
      {renderOptionModal()}
      {editPostModalVisible && (
        <EditPostModal
          privateCommunityId={privateCommunityId}
          visible={editPostModalVisible}
          onClose={closeEditPostModal}
          postDetail={{ ...postDetail, data: { ...data, text: textPost } }}
          onFinishEdit={handleOnFinishEdit}
        />
      )}
    </View>
  );
}
