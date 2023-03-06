import { Button } from 'react-bootstrap';
import React from 'react';
import { useAuth } from '../hooks/index.js';

function ExitButton({ children }) { // Берем из пропсов children (это содержимое нашего тэга)
  const auth = useAuth(); // Вызываем хук авторизации
  const userId = JSON.parse(localStorage.getItem('userId')); // Получаем значение userId из localStorage
  if ((auth.loggedIn || userId) && userId.token) { // ( Если пользователь залогинен
    // или у него есть userId ) и у него есть токен, то показываем кнопку ВЫЙТИ.
    return (
      <Button onClick={auth.logOut}>{children}</Button>
    );
  }

  return null;
}

export default ExitButton;
