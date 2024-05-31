import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChaptersState {
  chapters: Amity.Community[];
  chapterById: { [k: string]: Amity.Community };
}

const initialState: ChaptersState = {
  chapters: [],
  chapterById: {},
};

const chaptersSlice = createSlice({
  name: 'chapters',
  initialState,
  reducers: {
    setChapters: (
      state,
      { payload: chapters }: PayloadAction<Amity.Community[]>
    ) => {
      state.chapters = chapters;
      state.chapterById = chapters.reduce((acc, c) => {
        acc[c.communityId] = c;

        return acc;
      }, {});
    },
  },
});

export default chaptersSlice;
