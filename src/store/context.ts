/* eslint-disable indent */
import { createContext } from 'react';

export const SocialContext = createContext<{
  selectedChapterId: string;
  selectedChapterName: string;
  defaultChapterId: string;
  onDropdownClick: (value) => void;
  onMemberClick: (value) => void;
  screen: string;
}>({
  selectedChapterId: '',
  selectedChapterName: '',
  defaultChapterId: '',
  onDropdownClick: () => {},
  onMemberClick: () => {},
  screen: '',
});
