import { Outlet } from 'react-router-dom';
import { Navbar, Container } from 'react-bootstrap';
import React from 'react';
import ExitButton from './ExitButton.jsx';

function Layout() {
  return (
    <div className="d-flex flex-column h-100">
      <Navbar className="shadow-sm" expand="lg" variant="light" bg="white">
        <Container>
          <Navbar.Brand href="/">Hexlet Chat</Navbar.Brand>
          <ExitButton>Выйти</ExitButton>
        </Container>
      </Navbar>
      <Outlet />
    </div>
  );
}

export default Layout;
