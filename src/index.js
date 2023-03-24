// @ts-check
import ReactDOM from 'react-dom';
import 'core-js/stable/index.js';
import 'regenerator-runtime/runtime.js';

import '../assets/application.scss';
import init from './init.jsx';

const renderApp = () => {
  const vDom = init(); // инициализация приложения

  ReactDOM.render(vDom, document.getElementById('chat')); // рендерим результат инициализации в элемент с id 'chat'
};

renderApp();
