/* eslint-disable react/no-unstable-nested-components */
import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import type { RootStackParamList } from './RouteParamList';
import useAuth from '../hooks/useAuth';
// import Explore from '../screens/Explore';
import CategoryList from '../screens/CategorytList';
import CommunityList from '../screens/CommunityList';
import CommunityHome from '../screens/CommunityHome/index';
import { CommunitySetting } from '../screens/CommunitySetting/index';
import CommunityMemberDetail from '../screens/CommunityMemberDetail/CommunityMemberDetail';
import Home from '../screens/Home';
import PostDetail from '../screens/PostDetail';
import CreatePost from '../screens/CreatePost';
import UserProfile from '../screens/UserProfile/UserProfile';
import { EditProfile } from '../screens/EditProfile/EditProfile';
import UserProfileSetting from '../screens/UserProfileSetting/UserProfileSetting';
import CommunitySearch from '../screens/CommunitySearch';
import AllMyCommunity from '../screens/AllMyCommunity';
import CreateCommunity from '../screens/CreateCommunity';
import PendingPosts from '../screens/PendingPosts';
import type { MyMD3Theme } from '../providers/amity-ui-kit-provider';
import { useTheme } from 'react-native-paper';
import { Image, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { closeIcon } from '../svg/svg-xml-list';
import { useStyles } from '../routes/style';
import BackButton from '../components/BackButton';
import CloseButton from '../components/CloseButton';
import EditCommunity from '../screens/EditCommunity/EditCommunity';
import VideoPlayerFull from '../screens/VideoPlayerFullScreen';
import PostTypeChoiceModal from '../components/PostTypeChoiceModal/PostTypeChoiceModal';
import CreatePoll from '../screens/CreatePoll/CreatePoll';
import ReactionListScreen from '../screens/ReactionListScreen/ReactionListScreen';
import { SocialContext } from '../store/context';
import { MemberListModal } from '../screens/MemberListModal/MemberListModal';
import { EnterGroupName } from '../../src/screens/EnterGroupName/EnterGroupName';
import { ReactionUsersModal } from '../../src/screens/ReactionUsersModal/ReactionUsersModal';

export type TCommunity = {
  _id: string;
  path: string;
  isOfficial: boolean;
  isPublic: boolean;
  onlyAdminCanPost: boolean;
  postsCount: number;
  membersCount: number;
  moderatorMemberCount: number;
  updatedAt: string;
  createdAt: string;
  isDeleted: boolean;
  needApprovalOnPostCreation: boolean;
  displayName: string;
  tags: string[];
  metadata: {
    partners?: string[];
  };
  hasFlaggedComment: boolean;
  hasFlaggedPost: boolean;
  allowCommentInStory: boolean;
  communityId: string;
  channelId: string;
  userId: string;
  userPublicId: string;
  userInternalId: string;
  isJoined: boolean;
  avatarFileId: string;
  categoryIds: string[];
  notificationMode: 'default' | 'custom';
};

export default function SocialNavigator({
  showCompleteProfileCard,
  selectedChapterId,
  selectedChapterName,
  defaultChapterId,
  onDropdownClick,
  onMemberClick,
  socialNavigation,
  userData,
  screen,
  setIsTabBarVisible,
  chapters,
  scrollFeedToTop,
  setScrollFeedToTop,
  postId
}: {
  showCompleteProfileCard: boolean;
  selectedChapterId: string;
  selectedChapterName: string;
  defaultChapterId: string;
  onDropdownClick: (value) => void;
  onMemberClick: (value) => void;
  socialNavigation: any;
  userData: {
    avatarUrl: string;
    stepsCompleted: number;
  };
  screen: string;
  setIsTabBarVisible: (value: boolean) => void;
  chapters: TCommunity[],
  scrollFeedToTop: boolean,
  setScrollFeedToTop: React.Dispatch<React.SetStateAction<boolean>>,
  postId: string;
}) {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const { isConnected } = useAuth();
  const theme = useTheme() as MyMD3Theme;

  const styles = useStyles();
  return (
    <NavigationContainer independent={true}>
      <SocialContext.Provider
        value={{
          selectedChapterId,
          selectedChapterName,
          defaultChapterId,
          onDropdownClick,
          onMemberClick,
          screen,
          setIsTabBarVisible,
          showCompleteProfileCard,
          chapters,
          scrollFeedToTop,
          setScrollFeedToTop
        }}
      >
        {isConnected && (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Home">
              {() => (
                <Home
                  selectedChapterId={selectedChapterId}
                  selectedChapterName={selectedChapterName}
                  defaultChapterId={defaultChapterId}
                  socialNavigation={socialNavigation}
                  avatarUrl={userData?.avatarUrl}
                  stepsCompleted={userData?.stepsCompleted}
                  postId={postId}
                />
              )}
            </Stack.Screen>
            {/* <Stack.Screen name="Explore" component={Explore} /> */}
            <Stack.Screen
              name="PostDetail"
              component={PostDetail}
              options={{
                headerLeft: () => <BackButton />,
                title: '',
              }}
            />
            <Stack.Screen
              name="CategoryList"
              component={CategoryList}
              options={({ }) => ({
                title: 'Category',
              })}
            />
            <Stack.Screen
              name="CommunityHome"
              component={CommunityHome}
              options={({
                navigation,
                route: {
                  params: { communityName, communityId, isModerator },
                },
              }: any) => ({
                headerLeft: () => <BackButton />,
                title: communityName,
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() => {
                      // Handle button press here
                      navigation.navigate('CommunitySetting', {
                        communityId: communityId,
                        communityName: communityName,
                        isModerator: isModerator,
                      });
                    }}
                  >
                    <Image
                      source={require('../../assets/icon/threeDot.png')}
                      style={styles.dotIcon}
                    />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen name="PendingPosts" component={PendingPosts} />
            <Stack.Screen
              name="CommunitySearch"
              component={CommunitySearch}
              options={{
                headerShown: false, // Remove the back button
              }}
            />
            <Stack.Screen
              name="CommunityMemberDetail"
              component={CommunityMemberDetail}
              options={{
                headerLeft: () => <BackButton />,
                headerTitleAlign: 'center',
                title: 'Member',
              }}
            />
            <Stack.Screen
              name="CommunitySetting"
              component={CommunitySetting}
              options={({
                route: {
                  params: { communityName },
                },
              }: any) => ({
                title: communityName,
                headerTitleAlign: 'center',
                headerLeft: () => <BackButton />,
              })}
            />
            <Stack.Screen name="CreateCommunity" component={CreateCommunity} />
            <Stack.Screen name="CommunityList" component={CommunityList} />
            <Stack.Screen
              name="AllMyCommunity"
              component={AllMyCommunity}
              options={({
                navigation,
              }: {
                navigation: NativeStackNavigationProp<any>;
              }) => ({
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.goBack();
                    }}
                    style={styles.btnWrap}
                  >
                    <SvgXml
                      xml={closeIcon(theme.colors.base)}
                      width="15"
                      height="15"
                    />
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen
              name="CreatePost"
              component={CreatePost}
              options={{ headerShown: false }}
              initialParams={{
                selectedChapterId: selectedChapterId,
                selectedChapterName: selectedChapterName,
                defaultChapterId: defaultChapterId,
              }}
            />
            <Stack.Screen
              name="CreatePoll"
              component={CreatePoll}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfile}
              options={{
                title: '',
                headerLeft: () => <BackButton />,
              }}
            />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen
              name="EditCommunity"
              component={EditCommunity}
              options={({
                navigation,
              }: {
                navigation: NativeStackNavigationProp<any>;
              }) => ({
                headerLeft: () => <CloseButton navigation={navigation} />,
                title: 'Edit Profile',
                headerTitleAlign: 'center',
              })}
            />
            <Stack.Screen
              name="UserProfileSetting"
              component={UserProfileSetting}
            />
            <Stack.Screen
              name="VideoPlayer"
              component={VideoPlayerFull}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ReactionList"
              component={ReactionListScreen}
              options={{
                title: 'Reactions',
                headerLeft: () => <BackButton />,
              }}
            />
            <Stack.Group
              screenOptions={{
                presentation: 'modal',
              }}
            >
              <Stack.Screen name={'EnterGroupName'} component={EnterGroupName} />
              <Stack.Screen name={'MembersList'} component={MemberListModal} />
              <Stack.Screen name={'ReactionUsersList'} component={ReactionUsersModal} />
            </Stack.Group>
          </Stack.Navigator>
        )}
        <PostTypeChoiceModal />
      </SocialContext.Provider>
    </NavigationContainer>
  );
}