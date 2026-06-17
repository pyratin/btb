import blindTypeDefinitionCollection from '#browser/component/definition/blindType.json';

export default (roundIndex) => {
  const anteIndex = Math.floor(roundIndex / blindTypeDefinitionCollection.length);

  const roundFactor = !anteIndex ? 50 : 100;

  return (
    Math.round(
      (300 *
        Math.pow(2.6, anteIndex) *
        (blindTypeDefinitionCollection[
          roundIndex % blindTypeDefinitionCollection.length
        ]?.multiplier ?? 1.0)) /
        roundFactor
    ) * roundFactor
  );
};
