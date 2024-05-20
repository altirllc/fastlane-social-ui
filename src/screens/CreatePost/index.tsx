/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Alert,
  Image,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
// import { SafeAreaView } from 'react-native-safe-area-context';
import {
  arrowDown,
  cameraIcon,
  closeIcon,
  galleryIcon,
  playVideoIcon,
} from '../../svg/svg-xml-list';
import { useStyles } from './styles';
import ImagePicker, {
  launchImageLibrary,
  type Asset,
  launchCamera,
} from 'react-native-image-picker';
import LoadingImage from '../../components/LoadingImage';
import { createPostToFeed } from '../../providers/Social/feed-sdk';
import LoadingVideo from '../../components/LoadingVideo';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
import { useTheme } from 'react-native-paper';
import { CommunityRepository } from '@amityco/ts-sdk-react-native';
import { checkCommunityPermission } from '../../providers/Social/communities-sdk';
import useAuth from '../../hooks/useAuth';
import AmityMentionInput from '../../components/MentionInput/AmityMentionInput';
import { TSearchItem } from '../../hooks/useSearch';
// import { useSelector } from 'react-redux';
// import { RootState } from 'amity-react-native-social-ui-kit/src/redux/store';
import { getAmityUser } from 'amity-react-native-social-ui-kit/src/providers/user-provider';
import { UserInterface } from 'amity-react-native-social-ui-kit/src/types/user.interface';
import { SocialContext } from '../../store/context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface IDisplayImage {
  url: string;
  fileId: string | undefined;
  fileName: string;
  isUploaded: boolean;
  thumbNail?: string;
}
interface ICommunityItems {
  communityId: string;
  avatarFileId: string;
  displayName: string;
  isPublic: boolean;
  isOfficial: boolean;
}
export interface IMentionPosition {
  index: number;
  type: string;
  userId: string;
  length: number;
  displayName?: string;
}
const CreatePost = ({ route }: any) => {
  const theme = useTheme() as MyMD3Theme;
  const styles = useStyles();
  const { top } = useSafeAreaInsets();
  //const { targetId, targetType, targetName } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [inputMessage, setInputMessage] = useState('');
  const [targetId, setTargetId] = useState('');
  const [targetType, setTargetType] = useState('');
  const [defaultChapterName, setDefaultChapterName] = useState('');
  const [communityItems, setCommunityItems] = useState<ICommunityItems[]>([]);
  const [imageMultipleUri, setImageMultipleUri] = useState<string[]>([]);
  const [videoMultipleUri, setVideoMultipleUri] = useState<string[]>([]);
  const [displayImages, setDisplayImages] = useState<IDisplayImage[]>([]);
  const [displayVideos, setDisplayVideos] = useState<IDisplayImage[]>([]);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [mentionNames, setMentionNames] = useState<TSearchItem[]>([]);
  const [mentionsPosition, setMentionsPosition] = useState<IMentionPosition[]>(
    []
  );
  const [myUser, setMyUser] = useState<UserInterface>();
  const [communityObject, setCommunityObject] =
    useState<Amity.LiveObject<Amity.Community>>();
  const { data: community } = communityObject ?? {};
  const privateCommunityId = !community?.isPublic && community?.communityId;
  const { client, apiRegion } = useAuth();
  const userId = route?.params?.userId;
  const socialContext = useContext(SocialContext);
  const selectedChapterId = socialContext?.selectedChapterId;
  const selectedChapterName = socialContext?.selectedChapterName;
  const defaultChapterId = socialContext?.defaultChapterId;
  const onDropdownClick = socialContext?.onDropdownClick;

  useEffect(() => {
    if (selectedChapterName === 'All Chapters') {
      setTargetType('community');
      setTargetId(defaultChapterId);
    } else {
      setTargetType('community');
      setTargetId(selectedChapterId);
    }
  }, [selectedChapterId, selectedChapterName, userId]);

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
        setCommunityItems(formattedData);
      }
    );
    unsubscribe();
  };

  useEffect(() => {
    queryCommunities();
  }, []);

  useEffect(() => {
    if (
      communityItems?.length > 0 &&
      selectedChapterId === '' &&
      defaultChapterId !== ''
    ) {
      const chapterObj = communityItems.find(
        (item) => item.communityId === defaultChapterId
      );
      if (chapterObj) {
        setDefaultChapterName(chapterObj?.displayName);
      }
    }
  }, [communityItems, selectedChapterId, defaultChapterId]);

  const getMyUserDetail = useCallback(async () => {
    if (userId) {
      const { userObject } = await getAmityUser(userId);
      let formattedUserObject: UserInterface;

      formattedUserObject = {
        userId: userObject.data.userId,
        displayName: userObject.data.displayName,
        avatarFileId: userObject.data.avatarFileId,
      };
      setMyUser(formattedUserObject);
    }
  }, [userId]);

  const getCommunityDetail = useCallback(() => {
    if (targetType === 'community') {
      CommunityRepository.getCommunity(targetId, setCommunityObject);
    }
  }, [targetId, targetType]);

  useEffect(() => {
    getCommunityDetail();
  }, [getCommunityDetail]);

  useEffect(() => {
    if (userId) {
      getMyUserDetail();
    }
  }, [getMyUserDetail, userId]);

  const goBack = () => {
    navigation.goBack();
  };
  const handleCreatePost = async () => {
    const mentionUserIds = mentionNames.map((item) => item.id) as string[];
    if (displayImages.length > 0) {
      const fileIdArr: (string | undefined)[] = displayImages.map(
        (item) => item.fileId
      );

      const type: string = displayImages.length > 0 ? 'image' : 'text';
      const response = await createPostToFeed(
        targetType,
        targetId,
        {
          text: inputMessage,
          fileIds: fileIdArr as string[],
        },
        type,
        mentionUserIds.length > 0 ? mentionUserIds : [],
        mentionsPosition
      );
      if (response) {
        goBack();
      }
    } else {
      const fileIdArr: (string | undefined)[] = displayVideos.map(
        (item) => item.fileId
      );

      const type: string = displayVideos.length > 0 ? 'video' : 'text';

      const response = await createPostToFeed(
        targetType,
        targetId,
        {
          text: inputMessage,
          fileIds: fileIdArr as string[],
        },
        type,
        mentionUserIds.length > 0 ? mentionUserIds : [],
        mentionsPosition
      );
      if (targetType !== 'community') return goBack();
      if (
        !response ||
        community?.postSetting !== 'ADMIN_REVIEW_POST_REQUIRED' ||
        !(community as Record<string, any>).needApprovalOnPostCreation
      )
        return goBack();
      const res = await checkCommunityPermission(
        community.communityId,
        client as Amity.Client,
        apiRegion
      );
      if (
        res.permissions.length > 0 &&
        res.permissions.includes('Post/ManagePosts')
      )
        return goBack();
      Alert.alert(
        'Post submitted',
        'Your post has been submitted to the pending list. It will be reviewed by community moderator',
        [
          {
            text: 'OK',
            onPress: () => goBack(),
          },
        ],
        { cancelable: false }
      );
    }
  };

  const pickCamera = async () => {
    // const permission = await ImagePicker();

    const result: ImagePicker.ImagePickerResponse = await launchCamera({
      mediaType: 'mixed',
      quality: 1,
      presentationStyle: 'fullScreen',
      videoQuality: 'high',
    });

    if (
      result.assets &&
      result.assets.length > 0 &&
      result.assets[0] !== null &&
      result.assets[0]
    ) {
      if (result.assets[0].type?.includes('image')) {
        const imagesArr: string[] = [...imageMultipleUri];
        imagesArr.push(result.assets[0].uri as string);
        setImageMultipleUri(imagesArr);
      } else {
        const selectedVideos: Asset[] = result.assets;
        const imageUriArr: string[] = selectedVideos.map(
          (item: Asset) => item.uri
        ) as string[];
        const videosArr: string[] = [...videoMultipleUri];
        const totalVideos: string[] = videosArr.concat(imageUriArr);
        setVideoMultipleUri(totalVideos);
      }
    }
  };

  useEffect(() => {
    if (imageMultipleUri.length > 0 && displayImages.length === 0) {
      const imagesObject: IDisplayImage[] = imageMultipleUri.map(
        (url: string) => {
          const fileName: string = url.substring(url.lastIndexOf('/') + 1);

          return {
            url: url,
            fileName: fileName,
            fileId: '',
            isUploaded: false,
          };
        }
      );
      setDisplayImages((prev) => [...prev, ...imagesObject]);
    } else if (imageMultipleUri.length > 0 && displayImages.length > 0) {
      const filteredDuplicate = imageMultipleUri.filter((url: string) => {
        const fileName: string = url.substring(url.lastIndexOf('/') + 1);
        return !displayImages.some((item) => item.fileName === fileName);
      });

      const imagesObject: IDisplayImage[] = filteredDuplicate.map(
        (url: string) => {
          const fileName: string = url.substring(url.lastIndexOf('/') + 1);

          return {
            url: url,
            fileName: fileName,
            fileId: '',
            isUploaded: false,
          };
        }
      );
      setDisplayImages((prev) => [...prev, ...imagesObject]);
    }
  }, [imageMultipleUri]);

  const processVideo = async () => {
    if (videoMultipleUri.length > 0 && displayVideos.length === 0) {
      const videosObject: IDisplayImage[] = await Promise.all(
        videoMultipleUri.map(async (url: string) => {
          const fileName: string = url.substring(url.lastIndexOf('/') + 1);

          return {
            url: url,
            fileName: fileName,
            fileId: '',
            isUploaded: false,
            thumbNail: '',
          };
        })
      );
      setDisplayVideos((prev) => [...prev, ...videosObject]);
    } else if (videoMultipleUri.length > 0 && displayVideos.length > 0) {
      const filteredDuplicate = videoMultipleUri.filter((url: string) => {
        const fileName: string = url.substring(url.lastIndexOf('/') + 1);
        return !displayVideos.some((item) => item.fileName === fileName);
      });
      const videosObject: IDisplayImage[] = await Promise.all(
        filteredDuplicate.map(async (url: string) => {
          const fileName: string = url.substring(url.lastIndexOf('/') + 1);
          return {
            url: url,
            fileName: fileName,
            fileId: '',
            isUploaded: false,
            thumbNail: '',
          };
        })
      );
      setDisplayVideos((prev) => [...prev, ...videosObject]);
    }
  };
  useEffect(() => {
    processVideo();
  }, [videoMultipleUri]);

  const pickImage = async () => {
    const result: ImagePicker.ImagePickerResponse = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 10,
    });
    if (!result.didCancel && result.assets && result.assets.length > 0) {
      const selectedImages: Asset[] = result.assets;
      const imageUriArr: string[] = selectedImages.map(
        (item: Asset) => item.uri
      ) as string[];
      const imagesArr = [...imageMultipleUri];
      const totalImages = imagesArr.concat(imageUriArr);
      setImageMultipleUri(totalImages);
    }
  };
  const pickVideo = async () => {
    const result: ImagePicker.ImagePickerResponse = await launchImageLibrary({
      mediaType: 'video',
      quality: 1,
      selectionLimit: 10,
    });
    if (!result.didCancel && result.assets && result.assets.length > 0) {
      const selectedVideos: Asset[] = result.assets;
      const imageUriArr: string[] = selectedVideos.map(
        (item: Asset) => item.uri
      ) as string[];
      const videosArr = [...videoMultipleUri];
      const totalVideos = videosArr.concat(imageUriArr);
      setVideoMultipleUri(totalVideos);
    }
  };
  const handleOnCloseImage = (originalPath: string) => {
    setDisplayImages((prevData) => {
      const newData = prevData.filter(
        (item: IDisplayImage) => item.url !== originalPath
      ); // Filter out objects containing the desired value
      return newData; // Remove the element at the specified index
    });
  };
  const handleOnCloseVideo = (originalPath: string) => {
    setDisplayVideos((prevData) => {
      const newData = prevData.filter(
        (item: IDisplayImage) => item.url !== originalPath
      ); // Filter out objects containing the desired value
      return newData; // Remove the element at the specified index
    });
  };
  const handleOnFinishImage = (
    fileId: string,
    fileUrl: string,
    fileName: string,
    index: number,
    originalPath: string
  ) => {
    const imageObject: IDisplayImage = {
      url: fileUrl,
      fileId: fileId,
      fileName: fileName,
      isUploaded: true,
    };
    setDisplayImages((prevData) => {
      const newData = [...prevData];
      newData[index] = imageObject;
      return newData;
    });
    setImageMultipleUri((prevData) => {
      const newData = prevData.filter((url: string) => url !== originalPath); // Filter out objects containing the desired value
      return newData; // Update the state with the filtered array
    });
  };
  const handleOnFinishVideo = (
    fileId: string,
    fileUrl: string,
    fileName: string,
    index: number,
    originalPath: string,
    thumbnail: string
  ) => {
    const imageObject: IDisplayImage = {
      url: fileUrl,
      fileId: fileId,
      fileName: fileName,
      isUploaded: true,
      thumbNail: thumbnail,
    };
    setDisplayVideos((prevData) => {
      const newData = [...prevData];
      newData[index] = imageObject;
      return newData;
    });
    setVideoMultipleUri((prevData) => {
      const newData = prevData.filter((url: string) => url !== originalPath); // Filter out objects containing the desired value
      return newData; // Update the state with the filtered array
    });
  };

  const renderMyTimeLine = () => {
    return (
      <View style={styles.rowContainerMyTimeLine}>
        <View style={styles.imageNameContainer}>
          <Image
            style={styles.avatar}
            source={
              myUser
                ? {
                    uri: `https://api.${apiRegion}.amity.co/api/v3/files/${myUser.avatarFileId}/download`,
                  }
                : require('./../../../assets/icon/Placeholder.png')
            }
          />
          <Text style={styles.communityText}>{myUser?.displayName}</Text>
        </View>
        <TouchableOpacity
          style={styles.communityNameContainer}
          onPress={() => onDropdownClick(selectedChapterId)}
        >
          <Text style={styles.communityName}>
            {selectedChapterId !== ''
              ? selectedChapterName
              : defaultChapterName}
          </Text>
          <SvgXml
            xml={arrowDown(theme.colors.base)}
            width="12"
            height="12"
            style={styles.downArrow}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.AllInputWrap, { paddingTop: top }]}>
      {/* <SafeAreaView style={styles.barContainer} edges={['top']}> */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={goBack}>
          <SvgXml xml={closeIcon(theme.colors.base)} width="17" height="17" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Create Post</Text>
        </View>
        <TouchableOpacity
          disabled={
            inputMessage.length > 0 ||
            displayImages.length > 0 ||
            displayVideos.length > 0
              ? false
              : true
          }
          onPress={handleCreatePost}
        >
          <Text
            style={
              inputMessage.length > 0 ||
              displayImages.length > 0 ||
              displayVideos.length > 0
                ? styles.postText
                : [styles.postText, styles.disabled]
            }
          >
            Post
          </Text>
        </TouchableOpacity>
      </View>
      {renderMyTimeLine()}
      {/* </SafeAreaView> */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.AllInputWrap}
      >
        <ScrollView
          style={styles.container}
          scrollEnabled={isScrollEnabled}
          keyboardShouldPersistTaps="handled"
        >
          <AmityMentionInput
            privateCommunityId={privateCommunityId}
            onFocus={() => {
              setIsScrollEnabled(false);
            }}
            onBlur={() => {
              setIsScrollEnabled(true);
            }}
            multiline
            placeholder="What’s on your mind?"
            placeholderTextColor={theme.colors.baseShade3}
            setInputMessage={setInputMessage}
            mentionsPosition={mentionsPosition}
            setMentionsPosition={setMentionsPosition}
            mentionUsers={mentionNames}
            setMentionUsers={setMentionNames}
            isBottomMentionSuggestionsRender={true}
          />
          <View style={styles.imageContainer}>
            {displayImages.length > 0 && (
              <FlatList
                data={displayImages}
                renderItem={({ item, index }) => (
                  <LoadingImage
                    source={item.url}
                    onClose={handleOnCloseImage}
                    index={index}
                    onLoadFinish={handleOnFinishImage}
                    isUploaded={item.isUploaded}
                    fileId={item.fileId}
                  />
                )}
                numColumns={3}
              />
            )}
            {displayVideos.length > 0 && (
              <FlatList
                data={displayVideos}
                renderItem={({ item, index }) => (
                  <LoadingVideo
                    source={item.url}
                    onClose={handleOnCloseVideo}
                    index={index}
                    onLoadFinish={handleOnFinishVideo}
                    isUploaded={item.isUploaded}
                    fileId={item.fileId}
                    thumbNail={item.thumbNail as string}
                  />
                )}
                numColumns={3}
              />
            )}
          </View>
        </ScrollView>

        <View style={styles.InputWrap}>
          <TouchableOpacity
            disabled={displayVideos.length > 0 ? true : false}
            onPress={pickCamera}
          >
            <View style={styles.iconWrap}>
              <SvgXml xml={cameraIcon} width="27" height="27" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={displayVideos.length > 0 ? true : false}
            onPress={pickImage}
          >
            <View style={styles.iconWrap}>
              <SvgXml xml={galleryIcon} width="27" height="27" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={displayImages.length > 0 ? true : false}
            onPress={pickVideo}
            style={displayImages.length > 0 ? styles.disabled : []}
          >
            <View style={styles.iconWrap}>
              <SvgXml xml={playVideoIcon} width="27" height="27" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Keyboard.dismiss()}>
            <SvgXml xml={arrowDown(theme.colors.base)} width="20" height="20" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreatePost;
