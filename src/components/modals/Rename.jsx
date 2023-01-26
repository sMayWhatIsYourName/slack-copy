import React, { useEffect, useRef } from 'react';
import { Formik } from 'formik';
import {
  Modal, FormGroup, FormControl, Button, FormLabel,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import isUniqueChannelName from '../../utils/isUniqueChannelName.js';
import { useSocket } from '../../hooks/index.js';

const generateOnSubmit = (onHide, id, socket, name, buttonRef) => {
  buttonRef.current.setAttribute('disabled', '');
  socket.emit('renameChannel', { id, name }); // регистрируем событие сокета на изменение канала (передаем туда название канала и id)
  onHide();
};

function Rename(props) {
  const { t } = useTranslation();
  const socket = useSocket();
  const { onHide, modalInfo: { item: { id, name: prevName } }, channels } = props;
  // берем из пропсов функцию для закрытия модалки, каналы для проверки на уникальность
  // И информацию о модалке (предыдущее имя и id)
  const inputRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const feedbackStyle = {
    display: 'block',
  };

  return (
    <Modal show>
      <Modal.Header closeButton onHide={onHide}>
        <Modal.Title>Переименовать канал</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Formik
          onSubmit={({ name }, actions) => {
            if (name === '') {
              actions.setFieldError('name', t('errors.required'));
              return;
            }
            const isExist = isUniqueChannelName(name, channels);
            if (isExist) {
              actions.setFieldError('name', t('errors.unique'));
              return;
            }
            generateOnSubmit(onHide, id, socket, name, buttonRef);
          }}
          initialValues={{
            name: prevName,
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
                  id="name"
                  className="mb-2"
                  isInvalid={!!errors.name}
                />
                <FormLabel htmlFor="name" visuallyHidden>Имя канала</FormLabel>
              </FormGroup>
              <div className="invalid-feedback" style={feedbackStyle}>{errors.name}</div>
              <div className="d-flex justify-content-end">
                <Button type="button" className="me-2" onClick={onHide} variant="secondary">Отменить</Button>
                <Button type="submit" ref={buttonRef} variant="primary">Отправить</Button>
              </div>
            </form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
}

export default Rename;
