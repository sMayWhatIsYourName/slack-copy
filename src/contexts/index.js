import { createContext } from 'react';

export const authContext = createContext({}); // Создадим контекст авторизации для
// получения информации о сессии в компонентах
export const socketContext = createContext({}); // Создадим контекст для получения
// информации о сокете в компонентах
