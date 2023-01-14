import 'core-js/stable/index.js';
import 'regenerator-runtime/runtime.js';

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { io } from 'socket.io-client';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';

import App from './components/App.jsx';
import store from './slices/index.js';
import { actions as messagesActions } from './slices/messagesSlice.js';
import { actions as channelsActions } from './slices/channelsSlice.js';
import resources from './locales/index.js';

const initApp = () => {
  const socket = io(); // инициализируем объект сокета

  i18next // инициализируем интернационализацию
    .use(initReactI18next) // используем реактовскую интернациолизацию
    .init({
      lng: 'ru', // ставим русский язык
      resources, // вставляем импортированный словарь
    });

  const { t } = i18next; // эта функция переводит текст

  socket.on('newMessage', (msg) => { // создаем функцию-обработчик на отправку сообщения
    store.dispatch(messagesActions.addMessage(msg)); // добавляем наше сообщение во внутреннее хранилище
  });

  socket.on('newChannel', (msg) => { // создаем функцию-обработчик на создание канала
    store.dispatch(channelsActions.addChannel(msg)); // добавляем наш канал во внутреннее хранилище
    toast.success(t('success.create')); // уведомляем об успешном создании канала
  });

  socket.on('removeChannel', ({ id }) => { // создаем функцию-обработчик на удаление канала
    store.dispatch(channelsActions.removeChannel(id)); // удаляем наш канал из внутреннего хранилища
    toast.success(t('success.remove')); // уведомляем об успешном удалении канала
  });

  socket.on('renameChannel', ({ id, name }) => { // создаем функцию-обработчик на изменение канал
    const newObj = { // создаем объект канала, который потом отправим во внутреннее хранилище
      id,
      changes: {
        name,
      },
    };
    store.dispatch(channelsActions.renameChannel(newObj)); // переименовываем наш канал
    toast.success(t('success.rename')); // уведомляем об успешном переименовании канала
  });

  return (
    <Provider store={store}> {/* проводим наше хранилище */}
      <BrowserRouter> {/* проводим наш роутер для перехода по страницам */}
        <App socket={socket} /> {/* рендерим наше приложение */}
        <ToastContainer // проводим контейнер для уведомлений пользователя
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </BrowserRouter>
    </Provider>
  );
};

export default initApp;
