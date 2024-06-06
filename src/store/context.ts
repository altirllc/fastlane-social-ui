import { TCommunity } from '../../src/routes/SocialNavigator';
import { createContext } from 'react';

export const SocialContext = createContext<{
  selectedChapterId: string;
  selectedChapterName: string;
  defaultChapterId: string;
  onDropdownClick: (value) => void;
  onMemberClick: (value) => void;
  screen: string;
  setIsTabBarVisible: (value: boolean) => void;
  showCompleteProfileCard: boolean;
  chapters: TCommunity[];
  scrollFeedToTop: boolean;
  setScrollFeedToTop: React.Dispatch<React.SetStateAction<boolean>>
}>({
  selectedChapterId: '',
  selectedChapterName: '',
  defaultChapterId: '',
  onDropdownClick: () => { },
  onMemberClick: () => { },
  screen: '',
  setIsTabBarVisible: () => { },
  showCompleteProfileCard: false,
  chapters: [],
  scrollFeedToTop: false,
  setScrollFeedToTop: () => { }
});
