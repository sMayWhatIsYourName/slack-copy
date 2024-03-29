import axios from 'axios';
import React, { useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { useAuth } from '../hooks/index.js';

const routes = {
  registerPath: () => '/api/v1/signup', // путь для регистрации
};

function RegisterPage() {
  const { t } = useTranslation();

  const schema = yup.object().shape({ // объект валидации
    username: yup.string().trim().required(t('errors.required')).min(3, t('errors.username')) // задаем то, что поле username должно быть строчным, удаляем пробелы с конца и начала, в случае чего покажет то, что поле обязательно, а также если будет менее 3 символом покажет ошибку
      .max(20, t('errors.username')),
    password: yup.string().required(t('errors.required')).min(6, t('errors.password')), // тоже самое, что и username, но если меньше 6 символов покажет ошибку
    confirmPassword: yup.string().required(t('errors.required')) // строчное, обязательное и должно быть таким же как password
      .oneOf(
        [yup.ref('password'), null],
        t('errors.confirmPassword'),
      ),
  });

  const inputEl = useRef();
  const navigate = useNavigate();
  const auth = useAuth();
  const { logIn } = auth;
  useEffect(() => {
    inputEl.current.focus();
  }, []);
  return (
    <div className="container-fluid h-100">
      <div className="row justify-content-center align-content-center h-100">
        <div className="col-12 col-md-8 col-xxl-6">
          <div className="card shadow-sm">
            <div className="card-body d-flex flex-column flex-md-row justify-content-around align-items-center p-5">
              <div>
                <img className="rounded-circle" alt="Регистрация" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAPAAA/+EDimh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjNhNWRjYTFlLWRjN2QtNGFhOC04YjIyLTA3MjBkZDg5ZWMwNSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGOEIyODlBNzA3QTAxMUVCQTAwRENDMUIwMTM0QTBCNiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGOEIyODlBNjA3QTAxMUVCQTAwRENDMUIwMTM0QTBCNiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2ZTAyMmM2MS1iNTU4LTQ1MTktYjZkMS1iODE0ODU1NzAzYzkiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpjZGU2NGNiNC01NWIwLTA2NGEtOWViOS0wOWZhNWZmM2Q5OTAiLz4gPC9yZGY6RGVzY3JpcHRp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" />
              </div>
              <Formik
                validationSchema={schema}
                onSubmit={async (values, actions) => {
                  console.log(values);
                  try {
                    const { data: { token, username } } = await axios.post( // запрос на регистрацию
                      routes.registerPath(), // по пути регистрации
                      values,
                      {
                        timeout: 10000,
                        timeoutErrorMessage: 'Network Error',
                      },
                    );
                    const storage = { token };
                    const userName = { username };
                    localStorage.setItem('userId', JSON.stringify(storage));
                    localStorage.setItem('userName', JSON.stringify(userName));
                    logIn();
                    navigate('/');
                  } catch (err) {
                    if (err.response.status === 409) { // обработка ошибки когда аккаунт, который мы пытаемся зарегистрировать уже существует
                      actions.setFieldError('username', t('errors.exist'));
                      return;
                    }
                    if (err.message === 'Network Error') {
                      toast.error(t('errors.network'));
                      return;
                    }
                    throw err;
                  }
                }}
                initialValues={{
                  username: '',
                  password: '',
                  confirmPassword: '',
                }}
              >
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  values,
                  errors, // объект, в котором лежат невалидные поля и строковое представление ошибок
                }) => (
                  <Form className="col-12 col-md-6 mt-3 mt-mb-0" noValidate onSubmit={handleSubmit}> { /* отправка формы */ }
                    <h1 className="text-center mb-4">{t('registrationForm.headling')}</h1>
                    <Form.Floating className="mb-3">
                      <Form.Control
                        id="username"
                        name="username"
                        placeholder={t('errors.username')}
                        required
                        autoComplete="username"
                        onChange={handleChange}
                        onBlur={handleBlur} // вызывается когда наше поле было тронуто хотя бы 1 раз
                        value={values.username}
                        ref={inputEl}
                        isInvalid={!!errors.username}
                      />
                      <label className="form-label" htmlFor="username">{t('registrationForm.username')}</label>
                      <Form.Control.Feedback type="invalid" tooltip>
                        {errors.username}
                      </Form.Control.Feedback>
                    </Form.Floating>
                    <Form.Floating className="mb-3">
                      <Form.Control
                        id="password"
                        name="password"
                        placeholder={t('errors.password')}
                        required
                        type="password"
                        aria-describedby="passwordHelpBlock"
                        autoComplete="new-password"
                        onChange={handleChange}
                        onBlur={handleBlur} // вызывается когда наше поле было тронуто хотя бы 1 раз
                        value={values.password}
                        isInvalid={!!errors.password}
                      />
                      <label className="form-label" htmlFor="password">{t('registrationForm.password')}</label>
                      <Form.Control.Feedback type="invalid" tooltip>
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Floating>
                    <Form.Floating className="mb-4">
                      <Form.Control
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder={t('errors.confirmPassword')}
                        required
                        type="password"
                        autoComplete="new-password"
                        onChange={handleChange}
                        onBlur={handleBlur} // вызывается когда наше поле было тронуто хотя бы 1 раз
                        value={values.confirmPassword}
                        isInvalid={!!errors.confirmPassword}
                      />
                      <label className="form-label" htmlFor="confirmPassword">{t('registrationForm.confirmPassword')}</label>
                      <Form.Control.Feedback type="invalid" tooltip>
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    </Form.Floating>
                    <Button className="w-100" variant="outline-primary" type="submit">{t('buttons.register')}</Button> { /* регистрация */ }
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
