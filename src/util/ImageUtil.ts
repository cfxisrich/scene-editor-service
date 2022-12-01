const decodeBase64 = (base64: string) => {
  const filter = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(filter, 'base64');
};

export default {
  decodeBase64,
};
