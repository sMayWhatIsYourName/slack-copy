import { configureStore } from '@reduxjs/toolkit';
import channelsSlice from './channelsSlice.js';
import messagesReducer from './messagesSlice.js';

export default configureStore({ // Конфигурируем общее хранилище, передаем туда редьюсеры
  reducer: {
    messages: messagesReducer,
    channels: channelsSlice,
  },
});
