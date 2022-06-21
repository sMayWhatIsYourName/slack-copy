import React, { useEffect, useRef } from 'react';
import { Formik } from 'formik';
import {
  Modal, FormGroup, FormControl, Button, FormLabel,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import isUniqueChannelName from '../../utils/isUniqueChannelName.js';
import successCheck from '../../utils/successCheck.js';
import { useSocket } from '../../hooks/index.js';

const generateOnSubmit = (onHide, socket, name, buttonRef) => {
  buttonRef.current.setAttribute('disabled', '');
  socket.emit('newChannel', { name }, successCheck(buttonRef));
  onHide();
};

function Add(props) {
  const { t } = useTranslation();
  const socket = useSocket();
  const { onHide, channels } = props;
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
        <Modal.Title>Добавить канал</Modal.Title>
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
            generateOnSubmit(onHide, socket, name, buttonRef);
          }}
          initialValues={{
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

export default Add;
