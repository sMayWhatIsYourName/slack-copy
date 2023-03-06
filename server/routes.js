// @ts-check

import _ from 'lodash'; // подключаем библиотеку с вспомогательными функциями
import HttpErrors from 'http-errors'; // подключаем библиотеку ошибок для отправки их на клиент

const { Unauthorized, Conflict } = HttpErrors; // деструктуризируем

const getNextId = () => Number(_.uniqueId()); // создаем вспомогательную функцию для получения уникального id

const buildState = (defaultState) => { // возвращает базу данных, принимает состояние в качестве параметра
  const generalChannelId = getNextId(); // получаем УНИКАЛЬНЫЙ id для general канала
  const randomChannelId = getNextId(); // получаем УНИКАЛЬНЫЙ id для рандом канала
  const state = { // база данных
    channels: [ // каналы
      { id: generalChannelId, name: 'general', removable: false },
      { id: randomChannelId, name: 'random', removable: false },
    ],
    messages: [], // сообщения
    currentChannelId: generalChannelId, // канал, который будет выбран при заходе
    users: [ // пользователи
      { id: 1, username: 'admin', password: 'admin' },
      { id: 2, username: 'z', password: 'z' },
      { id: 3, username: 'vika', password: 'zzzzz' },
    ],
  };

  if (defaultState.messages) { // если есть сообщения, то добавляем их в нашу бд
    state.messages.push(...defaultState.messages);
  }
  if (defaultState.channels) { // если есть каналы, то добавляем их в нашу бд
    state.channels.push(...defaultState.channels);
  }
  if (defaultState.currentChannelId) { // если есть канал по умолчанию, то добавляем его в нашу бд
    state.currentChannelId = defaultState.currentChannelId;
  }
  if (defaultState.users) { // если есть пользователи, то добавляем их в нашу бд
    state.users.push(...defaultState.users);
  }

  return state; // возвращаем наше состояние
};

export default (app, defaultState = {}) => {
  const state = buildState(defaultState);

  app.io.on('connect', (socket) => {
    console.log({ 'socket.id': socket.id });

    // acknowledge - функция, которая даст знать клиенту о состоянии сообещния на сервере

    socket.on('newMessage', (message, acknowledge = _.noop) => { // на событие newMessage мы вешаем обработчик
      const messageWithId = {
        ...message,
        id: getNextId(),
      }; // формируем сообщение с unique id
      state.messages.push(messageWithId); // добавление в состояние нового сообщения
      acknowledge({ status: 'ok' }); // сообщаем о результате операции
      app.io.emit('newMessage', messageWithId); // создаем событие отправки сообщения и передаем туда сообщение
    });

    socket.on('newChannel', (channel, acknowledge = _.noop) => {
      const channelWithId = {
        ...channel,
        removable: true, // даем понять о том, что наш канал можно будет изменить и удалить
        id: getNextId(),
      };

      state.channels.push(channelWithId);
      acknowledge({ status: 'ok', data: channelWithId });
      app.io.emit('newChannel', channelWithId);
    });

    socket.on('removeChannel', ({ id }, acknowledge = _.noop) => {
      const channelId = Number(id); // приводим к числу id канала, который собираемся удалять
      state.channels = state.channels.filter((c) => c.id !== channelId); // оставляем все каналы кроме того, который мы хотим удалить
      state.messages = state.messages.filter((m) => m.channelId !== channelId); // удаляем все сообщения канала
      const data = { id: channelId };

      acknowledge({ status: 'ok' }); // отправляем клиенту статус действия
      app.io.emit('removeChannel', data); // создаем ивент для клиента об удалении канала
    });

    socket.on('renameChannel', ({ id, name }, acknowledge = _.noop) => {
      const channelId = Number(id);
      const channel = state.channels.find((c) => c.id === channelId); // ищем наш канал
      if (!channel) return;
      channel.name = name; // меняем имя у нужного канала

      acknowledge({ status: 'ok' });
      app.io.emit('renameChannel', channel);
    });
  });

  app.post('/api/v1/login', async (req, reply) => { // авторизация
    // req - request
    const username = _.get(req, 'body.username'); // берем username из нашего объекта req
    const password = _.get(req, 'body.password'); // берем password из нашего объекта req
    const user = state.users.find((u) => u.username === username);

    if (!user || user.password !== password) { // если пользователя нет ИЛИ пароли не совпадают, то кидаем ошибку
      reply.send(new Unauthorized());
      return;
    }

    const token = app.jwt.sign({ userId: user.id }); // создаем jwt token и передаем туда id пользователя
    reply.send({ token, username }); // отправляем на клиент токен и имя пользователя
  });

  app.post('/api/v1/signup', async (req, reply) => {
    const username = _.get(req, 'body.username');
    const password = _.get(req, 'body.password');
    const user = state.users.find((u) => u.username === username); // ищем пользователя по имени

    if (user) {
      reply.send(new Conflict()); // дропаем ошибку о том, что пользователь уже зарегистрирован
      return;
    }

    const newUser = { id: getNextId(), username, password };
    const token = app.jwt.sign({ userId: newUser.id });
    state.users.push(newUser); // добавляем в массив пользователей нового пользователя
    reply
      .code(201) // успешно создали нового пользователя
      .header('Content-Type', 'application/json; charset=utf-8') // указываем в каком формате возвращаемое значение
      .send({ token, username });
  });

  app.get('/api/v1/data', { preValidation: [app.authenticate] }, (req, reply) => {
    const user = state.users.find(({ id }) => id === req.user.userId); // есть ли этот пользователь

    if (!user) {
      reply.send(new Unauthorized()); // дропаем ошибку если его нет
      return;
    }

    reply
      .header('Content-Type', 'application/json; charset=utf-8')
      .send(_.omit(state, 'users')); // выдираем пользователей из нашего состояния (или бд)
  }); 

  app
    .get('*', (_req, reply) => { // всегда возвращаем страницу index pug
      reply.view('index.pug');
    });
};
