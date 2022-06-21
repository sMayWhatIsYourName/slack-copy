export default (name, list) => {
  const newChannel = list.find((channel) => channel.name === name);
  return Boolean(newChannel);
};
