import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './layout.jsx';
import { useAuth } from '../hooks/index.js';
import { authContext, socketContext } from '../contexts/index.js';
import LoginPage from '../pages/loginPage.jsx';
import ChatPage from '../pages/chatPage.jsx';
import NotFoundPage from '../pages/notFoundPage.jsx';
import RegisterPage from '../pages/registerPage.jsx';

function AuthProvider({ children }) {
  const userId = JSON.parse(localStorage.getItem('userId')); // Возьмем из локального хранилища инфу о токене
  const currentUserState = Boolean(userId); // есть ли токен
  const [loggedIn, setLoggedIn] = useState(currentUserState); // создадим состояние авторизации
  // и её обработчик с дефолтным значением currentUserState

  const logIn = () => setLoggedIn(true); // создадим функцию которая будет нас логинить
  const logOut = () => { // создадим функцию которая будет нас выбрасывать из аккаунта
    localStorage.removeItem('userId'); // удаляем токен
    localStorage.removeItem('userName'); // удаляем юзернейм
    setLoggedIn(false); // разлогиниваем пользователя
  };
  const memoized = useMemo(() => ({ loggedIn, logIn, logOut }), [loggedIn]); // создаем объект
  // сессии для передачи в контекст
  return (
    <authContext.Provider value={memoized}>
      {children}
    </authContext.Provider>
  );
}

function PrivateRoute({ children }) {
  const auth = useAuth(); // берем инфу о сессии из контекста

  return (
    auth.loggedIn ? children : <Navigate to="/login" />
    // если авторизован - выводим страницу, иначе навигируем на страницу логина
  );
}

function App({ socket }) {
  return (
    <AuthProvider>{ /* Компонент, внутри которого будет доступ к контексту сессии (авторизации)*/ }
      <socketContext.Provider value={socket}> { /* Проводим контекст сокета для создания/изменения/удаления канала и отправки сообщений */ }
        <Routes> { /* Компонент путей */ }
          <Route path="/" element={<Layout />}> { /* Ставим на путь "/" нашу разметку layout */ }
            <Route
              index
              element={(
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
          )}
            />
            { /* Кладем внутрь компонент PrivateRoute и он следит за авторизацией */ }
            <Route path="login" element={<LoginPage />} /> { /* Страница авторизации */ }
            <Route path="signup" element={<RegisterPage />} /> { /* Страница регистрации */ }
            <Route path="*" element={<NotFoundPage />} /> { /* Все остальные страницы */ }
          </Route>
        </Routes>
      </socketContext.Provider>
    </AuthProvider>
  );
}

export default App;
