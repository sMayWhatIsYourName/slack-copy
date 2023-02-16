import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch, batch } from 'react-redux';
import { useFormik } from 'formik';
import cn from 'classnames';
import { Button, Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import filter from 'leo-profanity';
import { toast } from 'react-toastify';

import { selectors as messagesSelectors } from '../slices/messagesSlice.js';
import { selectors as channelsSelectors, actions as channelsActions } from '../slices/channelsSlice.js';
import fetchData from '../slices/dataSlice.js';
import getModal from '../components/modals/index.js';
import { useSocket } from '../hooks/index.js';

filter.add(filter.getDictionary('ru')); // Добавляем русский в библиотеку-цензор матов

const renderButton = (id, name, removable, currentChannel, changeChannel, showModal) => {
  const isCurrent = id === currentChannel;
  const classes = cn('w-100', 'rounded-0', 'text-start', 'btn', {
    'btn-secondary': isCurrent, // если канал текущий, то выделим его определенным цветом
  });
  if (removable === false) { // если кнопка не может удаляться, то мы её рисуем без возможности удаления/редактирования
    return (
      <button onClick={changeChannel(id)} type="button" className={classes}>
        <span className="me-1">#</span>
        {name}
      </button>
    );
  }
  const variant = isCurrent ? 'secondary' : null; // если канал текущий, то выделим его определенным цветом
  const newClasses = cn(classes, 'text-truncate');
  return (
    <Dropdown align="start" className="d-flex btn-group" role="group" navbar={false}>
      <Button type="button" onClick={changeChannel(id)} variant={variant} className={newClasses}> { /* При нажатии на кнопку меняем канал */ }
        <span className="me-1">#</span>
        {name}
      </Button>
      <Dropdown.Toggle className="flex-grow-0" split="true" variant={variant}>
        <span className="visually-hidden">Управление каналом</span> { /* Это для скрин-ридеров */ }
      </Dropdown.Toggle>
      <Dropdown.Menu flip>
        <Dropdown.Item data-rr-ui-dropdown-item href="#" onClick={() => showModal('removing', id)}> { /* При нажатии открываем модалку удаления */ }
          Удалить
        </Dropdown.Item>
        <Dropdown.Item data-rr-ui-dropdown-item href="#" onClick={() => showModal('renaming', { id, name })}> { /* При нажатии открываем модалку переменования */ }
          Переименовать
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const renderChannelList = (channels, currentChannel, changeChannel, showModal) => {
  const list = channels.map(({ id, name, removable }) => ( // для каждого канала отрисовываем компонент кнопки
    <li className="nav-item w-100" key={id}>
      {renderButton(id, name, removable, currentChannel, changeChannel, showModal)}
    </li>
  ));
  return (
    <ul className="nav flex-column nav-pills nav-fill px-2">
      {list} { /* Список каналов */ }
    </ul>
  );
};

const renderModal = ({ modalInfo, channels, hideModal }) => {
  if (!modalInfo.type) { // если у модалки нет типа - возвращаем null
    return null;
  }

  const Component = getModal(modalInfo.type); // получаем нужную нам модалку
  return <Component channels={channels} modalInfo={modalInfo} onHide={hideModal} />; // рендерим её
};

const renderMessages = (list) => list.map((msg) => ( // компонент отрисовки списка сообщений
  <div key={msg.id} className="text-break mb-2">
    <b>{msg.author}</b>
    :
    {' '}
    {msg.text}
  </div>
));

function ChatPage() {
  const socket = useSocket(); // Получаем объект сокета
  const { t } = useTranslation(); // функция для локализации
  const [modalInfo, setModalInfo] = useState({ type: null, item: null }); // создаем состояние с инфой о модалке
  // в этом состоянии информация о том открыта ли сейчас модалка создания канала, переименования или удаления
  const hideModal = () => setModalInfo({ type: null, item: null }); // функция, которая закроет модалку
  const showModal = (type, item = null) => setModalInfo({ type, item }); // функция, которая откроет модалку
  const userName = JSON.parse(localStorage.getItem('userName')); // берем инфу о пользователе
  const dispatch = useDispatch();
  const messages = useSelector(messagesSelectors.selectAll); // получаем все сообщения
  const channels = useSelector(channelsSelectors.selectAll); // получаем все каналы
  const channelId = useSelector((state) => state.channels.currentChannel); // получаем текущий канал
  const filteredMessages = messages.filter((msg) => msg.channelId === channelId); // достаем только сообщения, которые принадлежат
  // текущему каналу
  const formik = useFormik({
    initialValues: { // исходные значения
      body: '',
    },
    onSubmit: ({ body }) => {
      formik.values.body = ''; // очистим поле ввода сообщения после отправки
      if (body.trim().length < 1) {
        return;
      }
      const message = filter.clean(body); // очищаем сообщение от матов
      const newMessage = {
        text: message,
        author: userName.username,
        channelId,
      }; // формируем объект сообщения
      socket.emit('newMessage', newMessage, ({ status }) => { // создаем событие нового сообщения
        // status нашего запроса
        if (status !== 'ok') { // если не ок, то показываем уведомление об ошибке
          toast.error(t('errors.network'));
        }
      });
    },
  });
  const currentChannel = channels.find(({ id }) => channelId === id); // проходимся по всем каналами и выбираем нужный нам по id

  useEffect(() => {
    dispatch(fetchData()); // запрашиваем информацию с сервера (каналы, сообщения) при инициализации компонента
  }, [dispatch]);

  const changeChannel = (id) => () => { // функция для смены канала
    dispatch(channelsActions.setCurrentChannel(id)); // изменяем текущий канал
  };

  return (
    <>
      <div className="container h-100 my-4 overflow-hidden rounded shadow">
        <div className="row h-100 bg-white flex-md-row">
          <div className="col-4 col-md-2 border-end pt-5 px-0 bg-light">
            <div className="d-flex justify-content-between mb-2 ps-4 pe-2">
              <span>Каналы</span>
              <button className="p-0 text-primary btn btn-group-vertical" onClick={() => showModal('adding')} type="button"> { /* клик по кнопке откроет модалку */ }
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                </svg>
                <span className="visually-hidden">+</span>
              </button>
            </div>
            {renderChannelList(channels, channelId, changeChannel, showModal)} { /* Отрисовка каналов */ }
          </div>
          <div className="col p-0 h-100">
            <div className="d-flex flex-column h-100">
              <div className="bg-light mb-4 p-3 shadow-sm small">
                <p className="m-0">
                  <b>
                    #
                    {' '}
                    {currentChannel && currentChannel.name}
                  </b>
                </p>
                <span className="text-muted">{t('chatForm.message', { count: filteredMessages.length })}</span> { /* Отрисовка количества сообщений */ }
              </div>
              <div id="messages-box" className="chat-messages overflow-auto px-5 ">
                {renderMessages(filteredMessages)} { /* Отрисовка сообщений */ }
              </div>
              <div className="mt-auto px-5 py-3">
                <form className="py-1 border rounded-2" noValidate="" onSubmit={formik.handleSubmit}> { /* При отправке формы будет вызвана функция-обработчик */ }
                  <div className="input-group has-validation">
                    <input
                      className="border-0 p-0 ps-2 form-control"
                      onChange={formik.handleChange}
                      value={formik.values.body}
                      name="body"
                      aria-label="Новое сообщение"
                      placeholder="Введите сообщение..."
                    />
                    <button className="btn btn-group-vertical" type="submit" disabled={formik.values.body === ''}> { /* Заблокировать кнопку если поле пустое */ }
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" height="20" fill="currentColor"><path fillRule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z" /></svg>
                      <span className="visually-hidden">{t('buttons.send')}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {renderModal({ modalInfo, channels, hideModal })} { /* Отрисовка модального окна */ }
    </>
  );
}

export default ChatPage;
