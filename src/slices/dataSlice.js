import axios from 'axios';
import {
  createAsyncThunk,
} from '@reduxjs/toolkit';

const routes = {
  dataPath: () => '/api/v1/data', // Путь для запроса
};

export default createAsyncThunk( // Нужен для создания асинхронных запросов
  'chat/data', // Название действия
  async () => {
    const userId = JSON.parse(localStorage.getItem('userId')); // берем id юзера из localStorage
    const response = await axios.get(routes.dataPath(), { // Делаем гет запрос на путь с 7 строчки
      headers: {
        Authorization: `Bearer ${userId.token}`, // Добавляем к запросу заголовок авторизации и передаем туда наш токен
      },
    });
    return response.data; // Возвращаем то, что пришло к нам с сервера
  },
);
