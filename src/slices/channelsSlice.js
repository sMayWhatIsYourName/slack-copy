import {
  createSlice,
  createEntityAdapter,
} from '@reduxjs/toolkit';

import fetchData from './dataSlice.js';

const channelsAdapter = createEntityAdapter(); // Инициализируем сущность адаптера для работы CRUD-операций (Create Read Update Delete)
const channelsSlice = createSlice({ // Создаем сущность
  name: 'channels', // Задаем ей имя channels
  initialState: channelsAdapter.getInitialState({ currentChannel: null, defaultChannel: null }), // Задаем дефолтное состояние
  reducers: {
    addChannel: (state, { payload }) => { // Действие добавления канала
      channelsAdapter.addOne(state, payload); // Добавляем в наше хранилище один канал
      state.currentChannel = payload.id; // Ставим только что созданный нами канал текущим
    },
    setCurrentChannel: (state, { payload }) => { // Действия выбора канала
      state.currentChannel = payload; // Делаем выбранный канал текущим
    },
    removeChannel: (state, { payload }) => { // Действие удаления канала
      channelsAdapter.removeOne(state, payload); // Удаляем переданный нам канал
      state.currentChannel = state.defaultChannel; // Делаем выбранным текущий канал дефолтный канал
    },
    renameChannel: channelsAdapter.updateOne, // Переименование канала
  },
  extraReducers: (builder) => { // Нужны для реакции на внешнее действие
    builder
      .addCase(fetchData.fulfilled, (state, action) => { // Добавляем обработку на случай успешного запроса данных
        const { channels, currentChannelId } = action.payload; // Деструктурируем полезную нагрузку
        channelsAdapter.addMany(state, channels); // Закидываем все каналы в наш стейт
        state.currentChannel = currentChannelId; // Делаем id канала, который пришел с сервера текущим
        state.defaultChannel = currentChannelId; // Делаем id канала, который пришел с сервера ДЕФОЛТНЫМ
      });
  },
});
export const { actions } = channelsSlice; // Получаем действия для взаимодействия с сущностью Channels
export const selectors = channelsAdapter.getSelectors((state) => state.channels); // Облегчаем доступ к каналам
export default channelsSlice.reducer; // Экспортируем по дефолту редьюсеры
