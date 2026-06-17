export default (bundle, card) => {
  const { packIndex = 0, faceDownFlag = false } = card || {};

  const key = `${faceDownFlag ? '_' : ''}playingCard`;

  const _key = faceDownFlag ? 0 : packIndex;

  return bundle[`${key}s`][`${key}-${_key}`];
};
