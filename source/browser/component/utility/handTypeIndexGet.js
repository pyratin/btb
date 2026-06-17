import _ from 'lodash';
import handTypeDefinitionCollection from '#browser/component/definition/handType.json';

/**
 * Evaluates the played hand and returns the index of the hand type from
 * handType.json.
 *
 * @param {Array} hand - List of card objects.
 * @returns {number | undefined} The index in handTypeDefinitionCollection matching the hand
 *   type (or undefined if no cards active).
 */
export default (hand) => {
  const cardActiveCollection = hand.filter(({ activeFlag }) => activeFlag);

  const rankFrequencyCollection = Object.values(
    cardActiveCollection.reduce((memo, { rankIndex }) => {
      return {
        ...memo,
        [rankIndex]: (memo[rankIndex] || 0) + 1
      };
    }, {})
  ).sort((a, b) => b - a);

  const flushFlag = Object.values(
    cardActiveCollection.reduce((memo, { suit }) => {
      return {
        ...memo,
        [suit]: (memo[suit] || 0) + 1
      };
    }, {})
  ).some((count) => count >= 5);

  const straightFlag =
    cardActiveCollection.length === 5 &&
    cardActiveCollection
      .reduce((memo, { rankIndexCollection }) => {
        return !memo.length
          ? rankIndexCollection.map((val) => [val])
          : memo.reduce((_memo, comb) => {
              return [
                ..._memo,
                ...rankIndexCollection.map((val) => [...comb, val])
              ];
            }, []);
      }, [])
      .some((combination) => {
        const uniqueSet = new Set(combination);

        return (
          uniqueSet.size === 5 &&
          Math.max(...combination) - Math.min(...combination) === 4
        );
      });

  return cardActiveCollection.length
    ? /** @type {[number, () => boolean][]} */ ([
        [
          handTypeDefinitionCollection.findIndex(({ id }) => id === 'straightFlush'),
          () => straightFlag && flushFlag
        ],
        [
          handTypeDefinitionCollection.findIndex(({ id }) => id === 'fourOfAKind'),
          () => rankFrequencyCollection[0] === 4
        ],
        [
          handTypeDefinitionCollection.findIndex(({ id }) => id === 'fullHouse'),
          () =>
            rankFrequencyCollection[0] === 3 && rankFrequencyCollection[1] === 2
        ],
        [handTypeDefinitionCollection.findIndex(({ id }) => id === 'flush'), () => flushFlag],
        [
          handTypeDefinitionCollection.findIndex(({ id }) => id === 'straight'),
          () => straightFlag
        ],
        [
          handTypeDefinitionCollection.findIndex(({ id }) => id === 'threeOfAKind'),
          () => rankFrequencyCollection[0] === 3
        ],
        [
          handTypeDefinitionCollection.findIndex(({ id }) => id === 'twoPair'),
          () =>
            rankFrequencyCollection[0] === 2 && rankFrequencyCollection[1] === 2
        ],
        [
          handTypeDefinitionCollection.findIndex(({ id }) => id === 'pair'),
          () => rankFrequencyCollection[0] === 2
        ],
        [handTypeDefinitionCollection.findIndex(({ id }) => id === 'highCard'), () => true]
      ]).reduce((memo, [index, conditionFn]) => {
        const match = conditionFn() ? index : undefined;
        return _.isFinite(memo) ? memo : match;
      }, /** @type {number | undefined} */ (undefined))
    : undefined;
};
