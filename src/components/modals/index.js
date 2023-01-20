import Add from './Add.jsx';
import Remove from './Remove.jsx';
import Rename from './Rename.jsx';

const modals = {
  adding: Add,
  removing: Remove,
  renaming: Rename,
};

export default (modalName) => modals[modalName];
// Функция, которая принимает в себя НАЗВАНИЕ нужного
// модального окна и возвращает само модальное окно
