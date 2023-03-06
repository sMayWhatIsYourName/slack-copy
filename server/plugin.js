// @ts-check

import Pug from 'pug';
import path from 'path';
import { fileURLToPath } from 'url';
import pointOfView from 'point-of-view';
import fastifySocketIo from 'fastify-socket.io';
import fastifyStatic from 'fastify-static';
import fastifyJWT from 'fastify-jwt';
import HttpErrors from 'http-errors';
// fastify - библиотека для написания backend
import addRoutes from './routes.js';

const { Unauthorized } = HttpErrors;

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const appPath = path.join(__dirname, '..');
const isDevelopment = !isProduction;

const setUpViews = (app) => {
  const devHost = 'http://localhost:8090';
  const domain = isDevelopment ? devHost : '';
  app.register(pointOfView, {
    engine: {
      pug: Pug,
    },
    defaultContext: {
      assetPath: (filename) => `${domain}/assets/${filename}`,
    },
    templates: path.join(__dirname, 'views'),
  });
};

const setUpStaticAssets = (app) => {
  app.register(fastifyStatic, {
    root: path.join(appPath, 'dist/public'),
    prefix: '/assets',
  });
};

const setUpAuth = (app) => {
  // TODO add socket auth
  app
    .register(fastifyJWT, { // делаем авторизацию с помощью jwt 
      secret: 'supersecret',
    })
    .decorate('authenticate', async (req, reply) => {
      try {
        await req.jwtVerify();
      } catch (_err) {
        reply.send(new Unauthorized());
      }
    });
};

export default async (app, options) => { // app - какой-то fastify объект
  setUpAuth(app);
  setUpViews(app);
  setUpStaticAssets(app);
  await app.register(fastifySocketIo); // регистрируем на наше приложение socket
  const users = [{ id: 101, username: 'sultan', password: 'sultan' }];
  const defaultState = {
    users
  };
  addRoutes(app, defaultState); // вызываем функцию для создания путей/событий для запросов

  return app;
};
