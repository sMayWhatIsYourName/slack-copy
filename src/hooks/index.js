import { useContext } from 'react';

import { authContext, socketContext } from '../contexts/index.js';

export const useAuth = () => useContext(authContext); // Создадим кастомный хук для
// обработки контекста авторизации
export const useSocket = () => useContext(socketContext); // Создадим кастомный хук для
// обработки контекста авторизации
