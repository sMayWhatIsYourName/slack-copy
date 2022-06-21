export default (ref) => ({ status }) => {
  if (status === 'ok') {
    ref.current?.removeAttribute('disabled');
  }
};
