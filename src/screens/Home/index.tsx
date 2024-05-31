/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { LogBox, Text, TouchableOpacity, View } from 'react-native';
import useAuth from '../../hooks/useAuth';
import Feed from '../../screens/Feed/index';
import { useStyles } from './styles';
import { Icon } from 'react-native-paper';
// import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
// import useConfig from '../../hooks/useConfig';
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
import { Avatar } from '../../../../src/components/Avatar/Avatar';
// @ts-ignore
import { screens } from '../../../../src/constants/screens';
import { SideBarIcon } from '../../svg/Sidebar';
import { ChevronDownIcon } from '../../svg/ChevronDown';
import { SocialContext } from '../../store/context';
// @ts-ignore
import { CompleteProfileCard } from '../../../../src/components/CompleteProfileCard/CompleteProfileCard';
import { Client } from '@amityco/ts-sdk-react-native';
import { RootState } from '~/redux/store';
import chaptersSlice from '../../redux/slices/chapters';

LogBox.ignoreAllLogs(true);
export default function Home({
  selectedChapterId,
  selectedChapterName,
  // defaultChapterId,
  socialNavigation,
  avatarUrl,
  stepsCompleted,
}: {
  selectedChapterId: string;
  selectedChapterName: string;
  defaultChapterId: string;
  socialNavigation: any;
  avatarUrl: string;
  stepsCompleted: number;
}) {
  const styles = useStyles();
  const { client } = useAuth();
  // const theme = useTheme() as MyMD3Theme;
  const dispatch = useDispatch();
  // const { openPostTypeChoiceModal } = uiSlice.actions;
  // const { excludes } = useConfig();
  const [activeTab] = useState<string>(TabName.NewsFeed);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useCustomTheme();
  const isFocused = useIsFocused();
  const { onDropdownClick, screen, setIsTabBarVisible, showCompleteProfileCard } =
    useContext(SocialContext);
  const { setChapters } = chaptersSlice.actions;
  const { chapters } = useSelector((state: RootState) => state.chapters);

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
        {screen === screens.Home ? (
        <TouchableOpacity
        style={styles.titleContainer}
        onPress={() => onDropdownClick(selectedChapterId)}
        >
        <Text style={styles.chapterName}>{selectedChapterName}</Text>
          <View style={styles.chevronDownIcon}>
            <ChevronDownIcon height={17} width={17} />
          </View>
      </TouchableOpacity>
        ) : null}
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
      {screen === screens.MarketPlace ? (
      <TouchableOpacity
        style={styles.marketplaceContainer}
        onPress={() => onDropdownClick(selectedChapterId)}
        disabled={screen === screens.MarketPlace}
      >
        <Text style={styles.marketplaceTitle}>{selectedChapterName}</Text>
      </TouchableOpacity>
    ) : null}
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
          targetType="community"
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
