import React from 'react';

function NotFoundPage() { // Компонент, который выводится если страница не была найдена
  return (
    <div className="text-center">
      <h1 className="h4 text-muted">Страница не найдена</h1>
      <p className="text-muted">
        Но вы можете перейти
        {' '}
        <a href="/">на главную страницу</a>
      </p>
    </div>
  );
}

export default NotFoundPage;
