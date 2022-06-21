import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './layout.jsx';
import { useAuth } from '../hooks/index.js';
import { authContext, socketContext } from '../contexts/index.js';
import LoginPage from '../pages/loginPage.jsx';
import ChatPage from '../pages/chatPage.jsx';
import NotFoundPage from '../pages/notFoundPage.jsx';
import RegisterPage from '../pages/registerPage.jsx';

function AuthProvider({ children }) {
  const userId = JSON.parse(localStorage.getItem('userId'));
  const currentUserState = Boolean(userId);
  const [loggedIn, setLoggedIn] = useState(currentUserState);

  const logIn = () => setLoggedIn(true);
  const logOut = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setLoggedIn(false);
  };
  const memoized = useMemo(() => ({ loggedIn, logIn, logOut }), [loggedIn]);
  return (
    <authContext.Provider value={memoized}>
      {children}
    </authContext.Provider>
  );
}

function PrivateRoute({ children }) {
  const auth = useAuth();

  return (
    auth.loggedIn ? children : <Navigate to="/login" />
  );
}

function App({ socket }) {
  return (
    <AuthProvider>
      <socketContext.Provider value={socket}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={(
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
          )}
            />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </socketContext.Provider>
    </AuthProvider>
  );
}

export default App;
