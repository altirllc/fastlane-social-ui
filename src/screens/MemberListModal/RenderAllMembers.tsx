import React, { ReactElement, memo, useContext, useEffect, useState } from "react";
import { useStyles } from "./styles";
import { FlatList, View, TouchableOpacity, TextInput } from "react-native";
import { UserInterface } from "../../../src/types";
// @ts-ignore
import { SearchIcon } from "@amityco/react-native-cli-chat-ui-kit/src/svg/SearchIcon";
import { CircleCloseIcon } from "../../../src/svg/CircleCloseIcon";
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../providers/amity-ui-kit-provider';
import { UserRepository } from "@amityco/ts-sdk-react-native";
import { SocialContext } from "../../store/context";
import UserItem from "../../components/UserItem";
// @ts-ignore
import { Separator } from '../../../../../src/components/Separator/Separator';

type TRenderAllMembers = {
    sectionedUserList: UserInterface[]
    setSectionedUserList: React.Dispatch<React.SetStateAction<UserInterface[]>>
    setSelectedSectionedUsers: React.Dispatch<React.SetStateAction<UserInterface[]>>
    selectedSectionedUsers: UserInterface[]
}

type TRenderItem = {
    item: UserInterface
    onUserPressed: (user: UserInterface) => void;
    selectedSectionedUsers: UserInterface[]
}
const RenderItem = ({ item, onUserPressed, selectedSectionedUsers }: TRenderItem): ReactElement => {
    const styles = useStyles();
    const userObj: UserInterface = {
        userId: item.userId,
        displayName: item.displayName as string,
        avatarFileId: item.avatarFileId as string,
        chapterName: item.chapterName,
    }
    const selectedUser = selectedSectionedUsers.some(
        (user) => user.userId === item.userId
    );

    return (
        <View style={{ paddingVertical: 5 }}>
            <UserItem
                showCheckMark={true}
                showThreeDot={false}
                user={userObj}
                hztPadding={false}
                isCheckmark={selectedUser}
                onPress={onUserPressed}
            />
            <Separator style={styles.itemSeparator} />
        </View>
    );
};


export const RenderAllMembers = memo(({ sectionedUserList, setSectionedUserList, setSelectedSectionedUsers, selectedSectionedUsers }: TRenderAllMembers) => {
    const styles = useStyles();
    const theme = useTheme() as MyMD3Theme;

    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { chapters } = useContext(SocialContext);

    //all members list
    const [usersObject, setUsersObject] =
        useState<Amity.LiveCollection<Amity.User>>();
    const { data: userArr = [], onNextPage, hasNextPage } = usersObject ?? {};

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
        let allMembers = [...createSectionGroup(userArr)];
        setSectionedUserList(allMembers);
    }, [userArr]);


    const onUserPressed = (user: UserInterface) => {
        const isIncluded = selectedSectionedUsers.some(
            (item) => item.userId === user.userId
        );
        if (isIncluded) {
            const removedUser = selectedSectionedUsers.filter(
                (item) => item.userId !== user.userId
            );
            setSelectedSectionedUsers(removedUser);
        } else {
            setSelectedSectionedUsers((prev) => [...prev, user]);
        }
    };

    const queryAccounts = (text: string = '') => {
        UserRepository.getUsers({ displayName: text, limit: 20 }, (data) => {
            setUsersObject(data);
        });
    };

    useEffect(() => {
        if (searchTerm.length === 0) {
            queryAccounts();
        }
    }, [searchTerm]);

    useEffect(() => {
        if (searchTerm.length > 2) {
            queryAccounts(searchTerm);
        }
    }, [searchTerm]);

    const handleLoadMore = () => {
        if (hasNextPage && typeof onNextPage === 'function') {
            onNextPage();
        }
    };

    return (
        <View style={{ flex: 1, height: '100%' }}>
            <View
                style={[
                    styles.inputWrap,
                    {
                        borderColor: isFocused
                            ? theme.colors.base
                            : theme.colors.baseShade3,
                    },
                ]}
            >
                <TouchableOpacity onPress={() => queryAccounts(searchTerm)}>
                    <SearchIcon
                        color={isFocused ? theme.colors.base : theme.colors.baseShade2}
                    />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    value={searchTerm}
                    onFocus={() => {
                        setIsFocused(true);
                    }}
                    onBlur={() => {
                        setIsFocused(false);
                    }}
                    onChangeText={(text: string) => setSearchTerm(text)}
                    placeholder="Search Members"
                    placeholderTextColor={'#6E768A'}
                />
                {searchTerm.length > 0 ? (
                    <TouchableOpacity onPress={() => setSearchTerm('')}>
                        <CircleCloseIcon color={theme.colors.base} />
                    </TouchableOpacity>
                ) : null}
            </View>
            <FlatList
                data={sectionedUserList}
                renderItem={({ item }) => (
                    <RenderItem
                        item={item}
                        onUserPressed={onUserPressed}
                        selectedSectionedUsers={selectedSectionedUsers}
                    />
                )}
                keyExtractor={(item) => item.userId.toString()}
                onEndReached={handleLoadMore}
                style={{ marginBottom: 50 }}
                showsVerticalScrollIndicator={false}
                onEndReachedThreshold={0.4}
            />
        </View>
    )
})
