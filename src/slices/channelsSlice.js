import {
  createSlice,
  createEntityAdapter,
} from '@reduxjs/toolkit';

import fetchData from './dataSlice.js';

const channelsAdapter = createEntityAdapter();
const channelsSlice = createSlice({
  name: 'channels',
  initialState: channelsAdapter.getInitialState({ currentChannel: null, defaultChannel: null }),
  reducers: {
    addChannel: (state, { payload }) => {
      channelsAdapter.addOne(state, payload);
      const stateCopy = state;
      stateCopy.currentChannel = payload.id;
    },
    setCurrentChannel: (state, { payload }) => {
      const stateCopy = state;
      stateCopy.currentChannel = payload;
    },
    removeChannel: (state, { payload }) => {
      channelsAdapter.removeOne(state, payload);
      const stateCopy = state;
      stateCopy.currentChannel = state.defaultChannel;
    },
    renameChannel: channelsAdapter.updateOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.fulfilled, (state, action) => {
        const { channels, currentChannelId } = action.payload;
        channelsAdapter.addMany(state, channels);
        const stateCopy = state;
        stateCopy.currentChannel = currentChannelId;
        stateCopy.defaultChannel = currentChannelId;
      });
  },
});
export const { actions } = channelsSlice;
export const selectors = channelsAdapter.getSelectors((state) => state.channels);
export default channelsSlice.reducer;
