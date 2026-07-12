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

const widthBreakpointCollection = [400, 707];

const windowInnerDimenesionGet = () => {
  const {
    visualViewport: { width = 0, height = 0 }
  } = window;

  return { width, height };
};

const textureScaleFactorGet = (windowInnerDimenesion) => {
  const { width } = windowInnerDimenesion;

  switch (true) {
    case width <= widthBreakpointCollection[0]:
      return 1.25;

    case width >= widthBreakpointCollection[1]:
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
    screenSmallFlag:
      windowInnerDimenesion.width <= widthBreakpointCollection[1],
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

const suitLength = 4;

const suitIndexCollection = Array.from({ length: suitLength }).map(
  (_, index) => index
);

export const cardGet = (
  _rankIndex,
  suitIndex,
  packIndex = _rankIndex + suitIndex * rankLength
) => {
  const rankIndex = _.isFinite(_rankIndex) ? _rankIndex + 1 : _rankIndex;

  const rankIndexCollection = [
    rankIndex,
    ...(_rankIndex === rankLength - 1 ? [0] : [])
  ];

  const [rank, faceFlag, chip] = (() => {
    const rankIndexFaceCardMinimum = 10;

    switch (true) {
      case rankIndex < rankIndexFaceCardMinimum:
        return (() => {
          const rank = rankIndex + 1;

          return [rank, false, rank];
        })();

      case rankIndex < 13:
        return [
          ['jack', 'queen', 'king'][rankIndex - rankIndexFaceCardMinimum],
          true,
          rankIndexFaceCardMinimum
        ];

      case rankIndex === 13:
        return ['Ace', false, rankIndexFaceCardMinimum + 1];

      default:
        return [undefined, false, 0];
    }
  })();

  const suitIndexCollection = [suitIndex];

  const suit = ['heart', 'club', 'diamond', 'spade'][suitIndexCollection[0]];

  return {
    id: packIndex,
    packIndex,
    rankIndex,
    rankIndexCollection,
    rank,
    faceFlag,
    chip,
    suitIndex,
    suitIndexCollection,
    suit,
    enhancementType: undefined,
    editionType: undefined,
    sealType: undefined,
    faceDownFlag: false,
    activeFlag: false,
    scoringFlag: false,
    entryFlag: false,
    discardFlag: false,
    playedFlag: false
  };
};

const packInitializedGet = () => {
  return Array.from({ length: rankLength }).reduce((memo, _, index) => {
    return [
      ...memo,
      ...Array.from({ length: suitLength }).map((_, _index) =>
        cardGet(index, _index)
      )
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

  return [
    ...hand
      .filter(
        ({ rankIndex, suitIndex }) =>
          _.isFinite(rankIndex) && _.isFinite(suitIndex)
      )
      .sort((a, b) => {
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
      }),
    ...hand.filter(
      ({ rankIndex, suitIndex }) =>
        !(_.isFinite(rankIndex) && _.isFinite(suitIndex))
    )
  ];
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

  const hand = handSortedGet(handSortTypeIndex, _deck.slice(0, handSize));

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

  const {
    windowInnerDimenesion,
    screenSmallFlag,
    textureScaleFactor,
    bundle,
    cardDimension
  } = bundleInitializedGet(_bundle);

  const handSize = 8;

  const handSortTypeIndex = 0;

  const pack = packInitializedGet();

  return {
    seed,
    _bundle,
    windowInnerDimenesion,
    screenSmallFlag,
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
          hand: handSortedGet(handSortTypeIndex, hand)
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
        ]);

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
        const { _bundle, bundle, ...rest } = state;

        return rest;
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
  () => {},
  () => {
    const { getState } = useStore;

    const { handSortTypeIndex, handSet } = getState();

    handSet((hand) =>
      handSortedGet(
        handSortTypeIndex,
        hand.map((card) => {
          const { rankIndex, suitIndex, packIndex } = card;

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

          const sealType = (() => {
            switch (true) {
              case !((rankIndex + 1) % 5):
                return 'gold';

              case !((rankIndex + 1) % 4):
                return 'purple';

              case !((rankIndex + 1) % 3):
                return 'red';

              case !((rankIndex + 1) % 2):
                return 'blue';

              default:
                return undefined;
            }
          })();

          return {
            ...card,
            ...(enhancementType === 'wild' && {
              suitIndexCollection
            }),
            ...(enhancementType === 'stone' && {
              ...cardGet(undefined, undefined, packIndex),
              _rankIndex: rankIndex,
              _suitIndex: suitIndex
            }),
            enhancementType,
            editionType,
            sealType
          };
        })
      )
    );
  },
  { fireImmediately: true }
);

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
