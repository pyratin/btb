import { create } from 'zustand';
import { combine, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { current, produce } from 'immer';
import seedrandom from 'seedrandom';
import _ from 'lodash';

import handTypeDefinitionCollection from '#browser/component/definition/handType.json';
import blindTypeDefinitionCollection from '#browser/component/definition/blindType.json';
import _bundleGet from '#browser/component/utility/_bundleGet';
import bundleGet from '#browser/component/utility/bundleGet';
import cardTextureGet from './utility/cardTextureGet';
import handScoringDetailGet from '#browser/component/utility/handScoringDetailGet';

const localStorageKey = 'state';

const localStorageItemGet = (key) => {
  return JSON.parse(localStorage.getItem(localStorageKey) || '{}')[key];
};

const windowInnerDimenesionGet = () => {
  const {
    visualViewport: { width = 0, height = 0 }
  } = window;

  return { width, height };
};

const textureScaleFactorGet = (windowInnerDimenesion) => {
  const widthCollection = [400, 707];

  const { width } = windowInnerDimenesion;

  switch (true) {
    case width <= widthCollection[0]:
      return 1.25;

    case width >= widthCollection[1]:
      return 2;

    default:
      return 1.5;
  }
};

const cardDimensionGet = (bundle) => {
  const { width, height } = cardTextureGet(bundle);

  return { width, height };
};

const bundleInitializedGet = (_bundle) => {
  const windowInnerDimenesion = windowInnerDimenesionGet();

  const textureScaleFactor = textureScaleFactorGet(windowInnerDimenesion);

  const bundle = bundleGet(_bundle, textureScaleFactor);

  const cardDimension = cardDimensionGet(bundle);

  return {
    windowInnerDimenesion,
    textureScaleFactor,
    bundle,
    cardDimension
  };
};

const seedGet = () => {
  const collection = [
    ...Array.from({ length: 10 }).map((_, index) => index),
    ...Array.from({ length: 26 }).map((_, index) =>
      String.fromCharCode(65 + index)
    )
  ];

  return Array.from({ length: 8 }).reduce(
    (memo) =>
      `${memo}${collection[Math.floor(Math.random() * collection.length)]}`,
    ''
  );
};

const rankLength = 13;

const cardGet = (
  _rankIndex,
  suitIndex,
  packIndex = _rankIndex + suitIndex * rankLength,
  faceDownFlag = true,
  activeFlag = false,
  // editionType = undefined,
  scoringFlag = false,
  scoringActiveFlag = false
) => {
  const rankIndex = _rankIndex + 1;

  const rankIndexCollection = [
    rankIndex,
    ...(_rankIndex === rankLength - 1 ? [0] : [])
  ];

  const rank = (() => {
    const faceCardIndexMinimum = 10;

    return rankIndex < faceCardIndexMinimum
      ? rankIndex + 1
      : ['Jack', 'Queen', 'King', 'Ace'][rankIndex - faceCardIndexMinimum];
  })();

  const suitIndexCollection = [suitIndex];

  const suit = ['heart', 'club', 'diamond', 'spade'][suitIndexCollection[0]];

  const editionType = (() => {
    switch (true) {
      case !((rankIndex + 1) % 4):
        return 'polychrome';

      case !((rankIndex + 1) % 3):
        return 'holographic';

      case !((rankIndex + 1) % 2):
        return 'folio';

      default:
        return undefined;
    }
  })();

  const enhancementType = (() => {
    switch (true) {
      case !((rankIndex + 1) % 9):
        return 'lucky';

      case !((rankIndex + 1) % 8):
        return 'gold';

      case !((rankIndex + 1) % 7):
        return 'stone';

      case !((rankIndex + 1) % 6):
        return 'steel';

      case !((rankIndex + 1) % 5):
        return 'glass';

      case !((rankIndex + 1) % 4):
        return 'wild';

      case !((rankIndex + 1) % 3):
        return 'mult';

      case !((rankIndex + 1) % 2):
        return 'bonus';

      default:
        return undefined;
    }
  })();

  return {
    id: packIndex,
    packIndex,
    rankIndex,
    rankIndexCollection,
    rank,
    suitIndex,
    suitIndexCollection,
    suit,
    faceDownFlag,
    activeFlag,
    editionType,
    enhancementType,
    scoringFlag,
    scoringActiveFlag
  };
};

const packInitializedGet = () => {
  return Array.from({ length: rankLength }).reduce((memo, _, index) => {
    return [
      ...memo,
      ...Array.from({ length: 4 }).map((_, _index) => cardGet(index, _index))
    ];
  }, []);
};

const collectionSuffledGet = (seed, collection) => {
  const random = seedrandom(seed);

  return collection
    .map((value) => [random(), value])
    .sort(([index], [_index]) => index - _index)
    .map(([, value]) => value);
};

const handSortedGet = (handSortTypeIndex, hand) => {
  const keyCollection = ['rankIndexCollection', 'suitIndexCollection'];

  return [...hand].sort((a, b) => {
    const fn = (object) => {
      return object[keyCollection[handSortTypeIndex]][0];
    };

    const _fn = (object) => object[keyCollection[1 - handSortTypeIndex]][0];

    const _collection = [a, b];

    const collection = !handSortTypeIndex
      ? _collection
      : [..._collection].reverse();

    return (
      fn(collection[1]) - fn(collection[0]) ||
      _fn(collection[0]) - _fn(collection[1])
    );
  });
};

const handCardGet = (card) => {
  return {
    ...card,
    faceDownFlag: false
  };
};

const roundInitializedGet = (
  seed,
  handSize,
  handSortTypeIndex,
  pack,
  index = 0
) => {
  const _deck = collectionSuffledGet(
    `roundInitializedGet-${index}-${seed}`,
    pack
  ).map((card, deckIndex) => ({ ...card, deckIndex }));

  const hand = handSortedGet(handSortTypeIndex, _deck.slice(0, handSize)).map(
    (card) => handCardGet(card)
  );

  const deck = _deck.slice(handSize);

  return {
    index,
    handPlayedCount: 0,
    discardCount: 0,
    deck,
    hand,
    handPlayed: undefined,
    muck: undefined,
    handTypeIndex: undefined
  };
};

const stateInitializedGet = async () => {
  const seed = localStorageItemGet('seed') || seedGet();

  const _bundle = await _bundleGet();

  const { windowInnerDimenesion, textureScaleFactor, bundle, cardDimension } =
    bundleInitializedGet(_bundle);

  const handSize = 8;

  const handSortTypeIndex = 0;

  const pack = packInitializedGet();

  return {
    seed,
    _bundle,
    windowInnerDimenesion,
    textureScaleFactor,
    bundle,
    cardDimension,
    roundCountMaximum: 8 * blindTypeDefinitionCollection.length,
    handPlayedCountMaximum: 4,
    discardCardCountMaximun: 5,
    discardCountMaximum: 4,
    cash: 4,
    handSize,
    handSortTypeIndex,
    pack,
    handTypeStatusCollection: handTypeDefinitionCollection.map(({ id }) => ({
      id,
      level: 1,
      count: 0
    })),
    round: roundInitializedGet(seed, handSize, handSortTypeIndex, pack),
    redirect: undefined
  };
};

const onWindowResizeHandle = (set) => {
  set((state) => {
    const rest = current(state);

    const { _bundle } = rest;

    return { ...rest, ...bundleInitializedGet(_bundle) };
  });
};

const redirectSet = (redirect, set) => {
  set((state) => {
    const { round, ...rest } = current(state);

    return {
      ...rest,
      redirect
    };
  });
};

const handSortTypeIndexSet = (handSortTypeIndex, set) => {
  set((state) => {
    const { round, ...rest } = current(state);

    return {
      ...rest,
      handSortTypeIndex,
      round: produce((round) => {
        const { hand, ...rest } =
          /** @type {ReturnType<typeof roundInitializedGet>} */ (
            current(round)
          );

        return {
          ...rest,
          hand: handSortedGet(handSortTypeIndex, hand).map((card) =>
            handCardGet(card)
          )
        };
      })(round)
    };
  });
};

const handSet = (___hand, set) => {
  set((state) => {
    const { round, ...rest } = current(state);

    return {
      ...rest,
      round: produce((round) => {
        const { hand, ...rest } =
          /** @type {ReturnType<typeof roundInitializedGet>} */ (
            current(round)
          );

        const __hand = _.isFunction(___hand) ? ___hand(hand) : ___hand;

        const { hand: _hand, handTypeIndex } = handScoringDetailGet(__hand);

        return {
          ...rest,
          hand: _hand,
          handTypeIndex
        };
      })(round)
    };
  });
};

const onHandCardDiscardTriggerHandle = (set) => {
  set((state) => {
    const { round, ...rest } = current(state);

    const { handSortTypeIndex } = rest;

    return {
      ...rest,
      round: produce((round) => {
        const { discardCount, hand, deck, muck, ...rest } =
          /** @type {ReturnType<typeof roundInitializedGet>} */ (
            current(round)
          );

        const discardCollection = hand.filter(({ activeFlag }) => activeFlag);

        const _discardCount = discardCount + 1;

        const _hand = handSortedGet(handSortTypeIndex, [
          ...hand.filter(({ activeFlag }) => !activeFlag),
          ...deck.slice(0, discardCollection.length)
        ]).map((card) => handCardGet(card));

        const _deck = deck.slice(discardCollection.length);

        const _muck = [...(muck || []), ...discardCollection];

        return {
          ...rest,
          discardCount: _discardCount,
          hand: _hand,
          deck: _deck,
          muck: _muck
        };
      })(round)
    };
  });
};

const onHandPlayedTriggerHandle = (set) => {
  set((state) => {
    const { round, ...rest } = current(state);

    return {
      ...rest,
      round: produce((round) => {
        const { handPlayedCount, hand, ...rest } =
          /** @type {ReturnType<typeof roundInitializedGet>} */ (
            current(round)
          );

        const _handPlayedCount = handPlayedCount + 1;

        const _hand = hand.filter(({ activeFlag }) => !activeFlag);

        const handPlayed = hand.filter(({ activeFlag }) => activeFlag);

        return {
          ...rest,
          handPlayedCount: _handPlayedCount,
          hand: _hand,
          handPlayed
        };
      })(round)
    };
  });
};

const useStore = create(
  persist(
    subscribeWithSelector(
      immer(
        combine(await stateInitializedGet(), (set) => {
          return {
            onWindowResizeHandle: () => onWindowResizeHandle(set),
            redirectSet: (redirect) => redirectSet(redirect, set),
            handSortTypeIndexSet: (handSortTypeIndex) =>
              handSortTypeIndexSet(handSortTypeIndex, set),
            handSet: (hand) => handSet(hand, set),
            onHandCardDiscardTriggerHandle: () =>
              onHandCardDiscardTriggerHandle(set),
            onHandPlayedTriggerHandle: () => onHandPlayedTriggerHandle(set)
          };
        })
      )
    ),
    {
      name: localStorageKey,
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);

          if (!str) return null;

          const { version, ...state } = JSON.parse(str);

          return {
            state: state,
            version: version
          };
        },
        setItem: (name, data) => {
          const flattened = {
            ...data.state,
            version: data.version
          };

          localStorage.setItem(name, JSON.stringify(flattened));
        },
        removeItem: (name) => localStorage.removeItem(name)
      },
      partialize: (state) => {
        const { seed } = state;

        return { seed };
      }
    }
  )
);

const _onWindowResizeHandle = () => {
  const { getState } = useStore;

  const { onWindowResizeHandle } = getState();

  onWindowResizeHandle();
};

window.removeEventListener('resize', _onWindowResizeHandle);

window.addEventListener('resize', _onWindowResizeHandle);

useStore.subscribe(
  ({ round: { index } }) => index,
  () => {
    const { getState } = useStore;

    const {
      round: { index },
      redirectSet
    } = getState();

    !index &&
      window.location.pathname.match(/^\/$/) &&
      redirectSet({ pathname: '/Ante' });
  },
  { fireImmediately: true }
);

export default useStore;
