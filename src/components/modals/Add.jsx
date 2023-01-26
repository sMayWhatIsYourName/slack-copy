import React, { useEffect, useRef } from 'react';
import { Formik } from 'formik';
import {
  Modal, FormGroup, FormControl, Button, FormLabel,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import isUniqueChannelName from '../../utils/isUniqueChannelName.js';
import { useSocket } from '../../hooks/index.js';

const generateOnSubmit = (onHide, socket, name, buttonRef) => {
  buttonRef.current.setAttribute('disabled', ''); // отключаем возможность нажатия на кнопку
  socket.emit('newChannel', { name }); // регистрируем событие сокета на создание канала (передаем туда название канала)
  onHide(); // вызываем функцию которая должна сработать при закрытии модального окна
};

function Add(props) {
  const { t } = useTranslation(); // функция, которая осуществляет перевод
  const socket = useSocket(); // объект сокета
  const { onHide, channels } = props;
  // берем из пропсов функцию для закрытия модалки и каналы для проверки на уникальность
  const inputRef = useRef(); // нужно для фокуса при открытии
  const buttonRef = useRef(); // нужно для проставления атрибута "disabled" при нажатии

  useEffect(() => {
    inputRef.current.focus(); // фокус на поле
  }, []);

  const feedbackStyle = { // инлайн-стили
    display: 'block',
  };

  return (
    <Modal show>
      { /* Компонент модалки, сразу ставим проп show = true чтоб показывать */ }
      <Modal.Header closeButton onHide={onHide}>
        { /* Обертка, которой добавляем кнопку и добавляем обработчик на закрытие */ }
        <Modal.Title>Добавить канал</Modal.Title>
        { /* заголовок модалки */ }
      </Modal.Header>

      <Modal.Body>
        <Formik
          onSubmit={({ name }, actions) => { // деструктуризируем, получаем name и экшены
            if (name === '') { // проверяем пустое ли название
              actions.setFieldError('name', t('errors.required')); // отображаем ошибку
              return;
            }
            const isExist = isUniqueChannelName(name, channels); // существует ли УЖЕ такой канал
            if (isExist) { // если существует уже такой канал - выводим ошибку
              actions.setFieldError('name', t('errors.unique'));
              return;
            }
            generateOnSubmit(onHide, socket, name, buttonRef);// вызываем функцию для отправки формы
          }}
          initialValues={{ // дефолтное значение поля
            name: '',
          }}
        >
          {({
            handleSubmit,
            handleChange,
            values,
            errors,
          }) => (
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <FormControl
                  ref={inputRef}
                  onChange={handleChange}
                  value={values.name}
                  data-testid="input-body"
                  name="name"
                  className="mb-2"
                  isInvalid={!!errors.name} // проверяем действительно ли поле не валидно
                />
                <FormLabel htmlFor="name" visuallyHidden>Имя канала</FormLabel>
                { /* для скрин ридеров, а так оно не видно */ }
              </FormGroup>
              <div className="invalid-feedback" style={feedbackStyle}>{errors.name}</div>
              { /* этот тэг будет отображаться если у нас
              ошибка и класс invalid-feedback сделаем текст красным */ }
              <div className="d-flex justify-content-end">
                <Button type="button" className="me-2" onClick={onHide} variant="secondary">Отменить</Button>
                { /* вешаем обработчик закрытия формы при клике */}
                <Button type="submit" ref={buttonRef} variant="primary">Отправить</Button>
                { /* кнопка для отправки формы */ }
              </div>
            </form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
}

export default Add;
