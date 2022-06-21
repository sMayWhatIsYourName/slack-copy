// @ts-check
import ReactDOM from 'react-dom';
import 'core-js/stable/index.js';
import 'regenerator-runtime/runtime.js';

import '../assets/application.scss';
import init from './init.jsx';

if (process.env.NODE_ENV !== 'production') {
  localStorage.debug = 'chat:*';
}

const renderApp = () => {
  const vDom = init();

  ReactDOM.render(vDom, document.getElementById('chat'));
};

renderApp();
