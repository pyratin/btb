import handTypeDefinitionCollection from '#browser/component/definition/handType.json';

/**
 * Evaluates the played hand and returns the index of the hand type from
 * handtype.json and the hand with scored flags.
 *
 * @param {Array} hand - List of card objects.
 * @returns {{ handTypeIndex: number | undefined; hand: Array }} Details of the
 *   evaluated hand and updated cards.
 */
export default (hand) => {
  const cardActiveCollection = hand.filter(({ activeFlag }) => activeFlag);

  const rankGroups = cardActiveCollection.reduce((memo, card) => {
    const { rankIndex } = card;
    return {
      ...memo,
      [rankIndex]: [...(memo[rankIndex] || []), card]
    };
  }, {});

  const sortedGroups = Object.values(rankGroups).sort((a, b) => {
    const lengthDiff = b.length - a.length;
    return lengthDiff !== 0 ? lengthDiff : b[0].rankIndex - a[0].rankIndex;
  });

  const suitGroups = cardActiveCollection.reduce((memo, card) => {
    const { suit } = card;
    return {
      ...memo,
      [suit]: [...(memo[suit] || []), card]
    };
  }, {});

  const flushGroup = Object.values(suitGroups).find(
    (group) => group.length >= 5
  );
  const flushFlag = !!flushGroup;

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

  const result = (() => {
    switch (true) {
      case !cardActiveCollection.length:
        return { handTypeIndex: undefined, scoringCardCollection: [] };

      case straightFlag && flushFlag:
        return {
          handTypeIndex: handTypeDefinitionCollection.findIndex(
            ({ id }) => id === 'straightFlush'
          ),
          scoringCardCollection: cardActiveCollection
        };

      case sortedGroups[0].length === 4:
        return {
          handTypeIndex: handTypeDefinitionCollection.findIndex(
            ({ id }) => id === 'fourOfAKind'
          ),
          scoringCardCollection: sortedGroups[0]
        };

      case sortedGroups[0].length === 3 && sortedGroups[1]?.length === 2:
        return {
          handTypeIndex: handTypeDefinitionCollection.findIndex(
            ({ id }) => id === 'fullHouse'
          ),
          scoringCardCollection: [...sortedGroups[0], ...sortedGroups[1]]
        };

      case flushFlag:
        return {
          handTypeIndex: handTypeDefinitionCollection.findIndex(
            ({ id }) => id === 'flush'
          ),
          scoringCardCollection: flushGroup
        };

      case straightFlag:
        return {
          handTypeIndex: handTypeDefinitionCollection.findIndex(
            ({ id }) => id === 'straight'
          ),
          scoringCardCollection: cardActiveCollection
        };

      case sortedGroups[0].length === 3:
        return {
          handTypeIndex: handTypeDefinitionCollection.findIndex(
            ({ id }) => id === 'threeOfAKind'
          ),
          scoringCardCollection: sortedGroups[0]
        };

      case sortedGroups[0].length === 2 && sortedGroups[1]?.length === 2:
        return {
          handTypeIndex: handTypeDefinitionCollection.findIndex(
            ({ id }) => id === 'twoPair'
          ),
          scoringCardCollection: [...sortedGroups[0], ...sortedGroups[1]]
        };

      case sortedGroups[0].length === 2:
        return {
          handTypeIndex: handTypeDefinitionCollection.findIndex(
            ({ id }) => id === 'pair'
          ),
          scoringCardCollection: sortedGroups[0]
        };

      default:
        return {
          handTypeIndex: handTypeDefinitionCollection.findIndex(
            ({ id }) => id === 'highCard'
          ),
          scoringCardCollection: sortedGroups[0] || []
        };
    }
  })();

  const _hand = hand.map((card) => {
    return {
      ...card,
      scoredFlag: result.scoringCardCollection.some(({ id }) => id === card.id)
    };
  });

  return {
    handTypeIndex: result.handTypeIndex,
    hand: _hand
  };
};
