import {
  createSlice,
  createEntityAdapter,
} from '@reduxjs/toolkit';

import fetchData from './dataSlice.js';

const messagesAdapter = createEntityAdapter(); // Создаем адаптер для работы с CRUD операциями
const messagesSlice = createSlice({ // Создаем сущность сообщений
  name: 'messages', // Задаем название сообщений
  initialState: messagesAdapter.getInitialState(), // Инициализируем состояние
  reducers: {
    addMessage: messagesAdapter.addOne, // Действие добавления сообщения
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.fulfilled, (state, action) => { // Обработка успешного выполнения запроса
        const { messages } = action.payload;
        messagesAdapter.addMany(state, messages); // Добавление всех сообщений, пришедших с сервера
      });
  },
});

export const { actions } = messagesSlice;
export const selectors = messagesAdapter.getSelectors((state) => state.messages);
export default messagesSlice.reducer;
