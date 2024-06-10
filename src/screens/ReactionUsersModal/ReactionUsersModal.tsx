import React, {
    ReactElement,
    useContext,
    useEffect,
    useState,
} from 'react';
import { View, Text, FlatList } from 'react-native';
// @ts-ignore
import { BottomModalScreen } from '../../../../../src/components/BottomModalScreen/BottomModalScreen';
import { useStyles } from './styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LoadingOverlay } from '../../../src/components/LoadingOverlay';
// @ts-ignore
import { Separator } from '../../../../../src/components/Separator/Separator';
import { ReactionRepository } from '@amityco/ts-sdk-react-native';
import useAuth from '../../../src/hooks/useAuth';
import { UserInterface } from '../../../src/types';
import { SocialContext } from '../../../src/store/context';
import UserItem from '../../../src/components/UserItem';

type TRenderItem = {
    item: UserInterface;
}
const RenderItem = ({ item }: TRenderItem): ReactElement => {
    const styles = useStyles();
    const userObj: UserInterface = {
        userId: item.userId,
        displayName: item.displayName as string,
        avatarFileId: item.avatarFileId as string,
        chapterName: item.chapterName,
    }

    return (
        <View style={{ paddingVertical: 5 }}>
            <UserItem
                showCheckMark={false}
                showThreeDot={false}
                user={userObj}
                hztPadding={false}
            />
            <Separator style={styles.itemSeparator} />
        </View>
    );
};

export const ReactionUsersModal = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [reactionsObj, setReactionObj] = useState<Amity.LiveCollection<Amity.Reactor>>();
    const { data: reactions = [], onNextPage, hasNextPage } = reactionsObj ?? {};
    const { isConnected } = useAuth();

    const [likedUsersList, setLikedUsersList] = useState<UserInterface[]>([]);

    const styles = useStyles();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const postId = route.params?.postId || ''
    const { chapters } = useContext(SocialContext);

    const onQueryReactions = () => {
        setLoading(true);
        ReactionRepository.getReactions(
            {
                referenceType: 'post',
                referenceId: postId,
            },
            (value) => {
                setReactionObj(value);
                if (value.data.length > 0 || (value.data.length === 0 && !value.hasNextPage && !value.loading)) {
                    setTimeout(() => {
                        setLoading(false);
                    }, 1000);
                }
            },
        );
    };

    const createSectionGroup = (users: Amity.User[]) => {
        return users
            .filter((eachUser) => eachUser?.metadata?.chapter?.id)
            .map((item) => {
                const chapterName =
                    chapters.find(
                        (eachChapter) =>
                            eachChapter.communityId === item?.metadata?.chapter?.id
                    )?.displayName || '';
                return {
                    userId: item.userId,
                    displayName: item.displayName as string,
                    avatarFileId: item.avatarFileId as string,
                    chapterId: item?.metadata?.chapter?.id || '',
                    chapterName: chapterName,
                };
            });
    };

    useEffect(() => {
        const likedReactions = reactions.filter((eachReaction) => eachReaction.reactionName === 'like');
        const users: Amity.User[] = [];
        likedReactions.forEach((eachReaction) => {
            if (eachReaction.user) {
                users.push(eachReaction.user)
            }
        })
        let allUsers = [...createSectionGroup(users)];
        setLikedUsersList(allUsers);
    }, [reactions]);

    useEffect(
        () => {
            if (!postId || !isConnected) return;
            onQueryReactions();
        },
        [isConnected, postId],
    );

    const handleLoadMore = () => {
        if (hasNextPage && onNextPage) {
            onNextPage();
        }
    };

    return (
        <>
            <BottomModalScreen
                onHolderPress={() => navigation.goBack()}
                style={styles.screen}
                horizontalIntent={true}
            >
                <View style={styles.header}>
                    <Text style={styles.chatHeader}>Likes</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                    <View>
                        <Text style={{ fontSize: 16 }}>LIKED BY</Text>
                    </View>
                    <View>
                        <Text>{`${likedUsersList.length} ${likedUsersList.length > 1 ? 'likes' : 'like'}`}</Text>
                    </View>
                </View>
                <Separator />
                {
                    !loading && likedUsersList.length === 0 ? (
                        <Text style={styles.noLikesText}>
                            No Likes yet.
                        </Text>
                    ) : (
                        <FlatList
                            data={likedUsersList}
                            renderItem={({ item }) => (
                                <RenderItem item={item} />
                            )}
                            keyExtractor={(item) => item.userId.toString()}
                            onEndReached={handleLoadMore}
                            style={{ marginBottom: 50, marginTop: 10 }}
                            showsVerticalScrollIndicator={false}
                            onEndReachedThreshold={0.4}
                        />
                    )
                }

            </BottomModalScreen>
            {loading ? <LoadingOverlay isLoading /> : null}
        </>
    );
};
