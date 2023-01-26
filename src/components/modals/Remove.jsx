import React, { useRef } from 'react';
import { Modal, FormGroup } from 'react-bootstrap';
import successCheck from '../../utils/successCheck.js';

import { useSocket } from '../../hooks/index.js';

const generateOnSubmit = ({ modalInfo: { item }, onHide }, socket, buttonRef) => (e) => {
  e.preventDefault();
  buttonRef.current.setAttribute('disabled', '');
  socket.emit('removeChannel', { id: item }, successCheck(buttonRef)); // регистрируем событие сокета на удаление канала (передаем туда id канала)
  onHide();
};

function Remove(props) {
  const { onHide } = props;
  const socket = useSocket();
  const buttonRef = useRef();
  const onSubmit = generateOnSubmit(props, socket, buttonRef);
  // вызываем функцию и замыкаем в ней props, socket и buttonRef
  // в ответ получаем другую функцию, которую мы передаем на submit формы

  return (
    <Modal show>
      <Modal.Header closeButton onHide={onHide}>
        <Modal.Title>Удалить канал</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={onSubmit}>
          <FormGroup>
            <p className="lead">Уверены?</p>
            <div className="d-flex justify-content-end">
              <button className="me-2 btn btn-secondary" onClick={onHide} type="button">Отменить</button>
              <button type="submit" ref={buttonRef} className="btn btn-danger">Удалить</button>
            </div>
          </FormGroup>
        </form>
      </Modal.Body>
    </Modal>
  );
}

export default Remove;
