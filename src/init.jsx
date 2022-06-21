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
  const socket = io();

  i18next
    .use(initReactI18next)
    .init({
      lng: 'ru',
      resources,
    });

  const { t } = i18next;

  socket.on('newMessage', (msg) => {
    store.dispatch(messagesActions.addMessage(msg));
  });

  socket.on('newChannel', (msg) => {
    store.dispatch(channelsActions.addChannel(msg));
    toast.success(t('success.create'));
  });

  socket.on('removeChannel', ({ id }) => {
    store.dispatch(channelsActions.removeChannel(id));
    toast.success(t('success.remove'));
  });

  socket.on('renameChannel', (msg) => {
    const { id, name } = msg;
    const newObj = {
      id,
      changes: {
        name,
      },
    };
    store.dispatch(channelsActions.renameChannel(newObj));
    toast.success(t('success.rename'));
  });

  return (
    <Provider store={store}>
      <BrowserRouter>
        <App socket={socket} />
        <ToastContainer
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
