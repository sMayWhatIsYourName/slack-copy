export default (ref) => ({ status }) => {
  if (status === 'ok') {
    ref.current?.removeAttribute('disabled'); // делаем кнопку снова доступной для нажатия дабы избежать двойных запросов/гонок запросов
  }
};
