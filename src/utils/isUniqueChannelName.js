export default (name, list) => { // функция проверяет на уникальность имя канала
  const newChannel = list.find((channel) => channel.name === name); // смотрим в массиве каналов есть ли уже такой
  return Boolean(newChannel);
};
