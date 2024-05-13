/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, TouchableOpacity, LogBox } from 'react-native';
import useAuth from '../../hooks/useAuth';
import GlobalFeed from '../GlobalFeed';
import { useStyles } from './styles';
import { Icon } from 'react-native-paper';
// import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
// import useConfig from '../../hooks/useConfig';
import { TabName } from '../../enum/tabNameState';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getShadowProps } from '../../theme/helpers';
import { useCustomTheme } from '../../hooks/useCustomTheme';
import { PlusIcon } from '../../svg/PlusIcon';

LogBox.ignoreAllLogs(true);
export default function Home({
  hideCompleteProfileCard,
}: {
  hideCompleteProfileCard: boolean;
  selectedChapterId: string;
  selectedChapterName: string;
}) {
  const styles = useStyles();
  const { client } = useAuth();
  // const theme = useTheme() as MyMD3Theme;
  // const { excludes } = useConfig();
  const [activeTab] = useState<string>(TabName.NewsFeed);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useCustomTheme();

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
  // return null;
  return (
    <View>
      {/* <CustomTab
        tabName={
          excludes.includes(ComponentID.StoryTab)
            ? [TabName.NewsFeed, TabName.Explore]
            : [TabName.NewsFeed, TabName.Explore, TabName.MyCommunities]
        }
        onTabChange={setActiveTab}
      /> */}
      {activeTab === TabName.NewsFeed ? (
        <View>
          <GlobalFeed />
          {/* <FloatingButton onPress={openModal} /> */}
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
      ) : activeTab === TabName.Explore ? (
        <View>{/* <Explore /> */}</View>
      ) : (
        <View>{/* <AllMyCommunity /> */}</View>
      )}
    </View>
  );
}
