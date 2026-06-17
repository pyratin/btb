import handTypeDefinitionCollection from '#browser/component/definition/handType.json';

export default (level, handIndex) => {
  const handTypeDefinition = handTypeDefinitionCollection[handIndex];

  return {
    chip:
      handTypeDefinition.chipBase +
      (level - 1) * handTypeDefinition.chipUpgrade,
    multiplier:
      handTypeDefinition.multiplierBase +
      (level - 1) * handTypeDefinition.multiplierUpgrade
  };
};
