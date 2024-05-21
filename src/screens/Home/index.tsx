/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, LogBox, Text } from 'react-native';
import useAuth from '../../hooks/useAuth';
import Feed from '../../screens/Feed/index';
import { useStyles } from './styles';
import { Icon } from 'react-native-paper';
// import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
// import useConfig from '../../hooks/useConfig';
import { TabName } from '../../enum/tabNameState';
import { DrawerActions, useNavigation } from '@react-navigation/native';
// import { useDispatch } from 'react-redux';
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

LogBox.ignoreAllLogs(true);
export default function Home({
  hideCompleteProfileCard,
  selectedChapterId,
  selectedChapterName,
  // defaultChapterId,
  socialNavigation,
  avatarUrl,
  stepsCompleted,
}: {
  hideCompleteProfileCard: boolean;
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
  // const dispatch = useDispatch();
  // const { openPostTypeChoiceModal } = uiSlice.actions;
  // const { excludes } = useConfig();
  const [activeTab] = useState<string>(TabName.NewsFeed);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useCustomTheme();
  const { onDropdownClick } = useContext(SocialContext);

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

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.welcomeContainer,
          { backgroundColor: colors.secondary.main },
        ]}
      >
        <View style={styles.width1}>
          <TouchableOpacity
            onPress={() => {
              socialNavigation.dispatch(DrawerActions.openDrawer());
            }}
          >
            <SideBarIcon height={30} width={30} />
          </TouchableOpacity>
        </View>
        <View style={styles.width2} />
        <View style={styles.width1}>
          <Avatar
            image={avatarUrl}
            size={40}
            onPress={() => {
              socialNavigation.navigate(screens.Profile);
            }}
            light={true}
            shadow
            disabled={hideCompleteProfileCard}
          />
        </View>
      </View>
      <TouchableOpacity
        style={styles.titleContainer}
        onPress={() => onDropdownClick(selectedChapterId)}
      >
        <Text style={styles.chapterName}>{selectedChapterName}</Text>
        <View style={styles.chevronDownIcon}>
          <ChevronDownIcon height={17} width={17} />
        </View>
      </TouchableOpacity>
      {hideCompleteProfileCard ? (
        <View style={[styles.cardContainer]}>
          <CompleteProfileCard
            onPress={() => {
              socialNavigation.navigate(screens.CompleteProfile);
            }}
            stepsCompleted={stepsCompleted}
          />
        </View>
      ) : null}
      <Feed
        targetId={selectedChapterId}
        targetType="community"
        selectedChapterName={selectedChapterName}
      />
      <TouchableOpacity
        onPress={openModal}
        style={[
          hideCompleteProfileCard
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
