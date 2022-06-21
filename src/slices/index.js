import { configureStore } from '@reduxjs/toolkit';
import channelsSlice from './channelsSlice.js';
import messagesReducer from './messagesSlice.js';

export default configureStore({
  reducer: {
    messages: messagesReducer,
    channels: channelsSlice,
  },
});
