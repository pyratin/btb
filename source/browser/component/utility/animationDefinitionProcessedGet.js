export default ({ from, to }) => {
  const { layout: fromLayout, ...fromRest } = from;

  const { layout: toLayout, ...toRest } = to;

  let target = { ...fromLayout, ...fromRest };

  return [target, { ...toLayout, ...toRest }, { ...fromLayout, ...fromRest }];
};
