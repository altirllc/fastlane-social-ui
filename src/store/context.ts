import { createContext } from 'react';

export const SocialContext = createContext<{
  selectedChapterId: string;
  selectedChapterName: string;
  defaultChapterId: string;
  onDropdownClick: (value) => void;
  onMemberClick: (value) => void;
  screen: string;
  setIsTabBarVisible: (value: boolean) => void;
}>({
  selectedChapterId: '',
  selectedChapterName: '',
  defaultChapterId: '',
  onDropdownClick: () => {},
  onMemberClick: () => {},
  screen: '',
  setIsTabBarVisible: () => {},
});
