import { useRef, useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import * as pixiJs from 'pixi.js';
import { Container, Sprite } from 'pixi.js';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';
import { gsap } from 'gsap';
import { PixiPlugin as gsapPixiPlugin } from 'gsap/PixiPlugin';
import { useGSAP } from '@gsap/react';

import useStore from '#browser/component/useStore';
import useTouchTilt from '#browser/component/utility/useTouchTilt';
import Card from '#browser/Component/Card';

gsap.registerPlugin(gsapPixiPlugin, useGSAP);
gsapPixiPlugin.registerPIXI(pixiJs);

const containerElementWidthGet = (containerElement) => {
  const { layout: { _computedLayout: { width = 0 } = {} } = {} } =
    containerElement;

  return width;
};

const _cardTransformGet = (hand, cardDimension, containerElement) => {
  const _width = containerElementWidthGet(containerElement);

  const cardWidthFactor = 0.75;

  const width = Math.min(
    ...[_width / hand.length, cardDimension.width * cardWidthFactor].map(
      (cardWidth) => cardWidth * hand.length
    )
  );

  const cardWidth = width / hand.length;

  const _offset = Math.abs(_width - width) / 2;

  const __offset = _offset
    ? ((1 - cardWidthFactor) * cardDimension.width) / 2
    : 0;

  const offset = _offset - __offset;

  return { cardWidth, offset };
};

const cardTransformGet = (index, hand, cardDimension, containerElement) => {
  const { cardWidth, offset } = _cardTransformGet(
    hand,
    cardDimension,
    containerElement
  );

  const _index = (() => {
    const indexMiddle = (hand.length - 1) / 2;

    return index < indexMiddle
      ? index - Math.floor(indexMiddle)
      : index - Math.ceil(indexMiddle);
  })();

  const angle = _index * 2;

  const angleRad = (angle * Math.PI) / 180;

  const swingX = cardDimension.height * Math.sin(angleRad);

  return {
    x: offset + cardWidth * index + cardDimension.width / 2 - swingX * 0.8,
    y:
      Math.abs(_index * 4) +
      (() => {
        const { activeFlag } = hand[index];

        return activeFlag ? -30 : 0;
      })() +
      cardDimension.height,
    angle
  };
};

const onCardCollectionAnimationCompleteHandle = (
  index,
  collection,
  onComplete
) => index === collection.length - 1 && onComplete();

const entryAnimationHandle = (
  collection,
  cardDimension,
  containerElement,
  onComplete
) => {
  const gsapTimeline = gsap.timeline();

  collection?.map((card, index, collection) => {
    const element = containerElement.getChildByLabel(card.id);

    gsapTimeline.fromTo(
      element,
      {
        pixi: card.entryFlag
          ? (() => {
              const { width, height } = cardDimension;

              return {
                x: containerElementWidthGet(containerElement) + width / 2,
                y: height,
                angle: 20,
                skewX: -50,
                skewY: 50,
                alpha: 0
              };
            })()
          : (() => {
              const { x, y, angle } = element;

              return { x, y, angle };
            })()
      },
      {
        pixi: {
          ...cardTransformGet(
            index,
            collection,
            cardDimension,
            containerElement
          ),
          skewX: 0,
          skewY: 0,
          alpha: 1
        },
        duration: 0.35,
        ease: 'back.out(1.4)',
        onComplete: () =>
          onCardCollectionAnimationCompleteHandle(index, collection, onComplete)
      },
      index * 0.08
    );
  });
};

const activeAnimationHandle = (
  collection,
  cardDimension,
  containerElement,
  onComplete
) => {
  const gsapTimeline = gsap.timeline();

  collection.map((card, index) => {
    const element = containerElement.getChildByLabel(card.id);

    gsapTimeline.to(
      element,
      {
        pixi: cardTransformGet(
          index,
          collection,
          cardDimension,
          containerElement
        ),
        duration: 0.1,
        ease: 'back.out(1.5)',
        onComplete: () =>
          onCardCollectionAnimationCompleteHandle(index, collection, onComplete)
      },
      0
    );
  });
};

const sortAnimationHandle = (
  collection,
  cardDimension,
  containerElement,
  onComplete
) => {
  const gsapTimeline = gsap.timeline();

  collection.map((card, index, collection) => {
    const element = containerElement.getChildByLabel(card.id);

    gsapTimeline.to(
      element,
      {
        pixi: cardTransformGet(
          index,
          collection,
          cardDimension,
          containerElement
        ),
        duration: 0.35,
        ease: 'back.out(1.4)',
        onComplete: () =>
          onCardCollectionAnimationCompleteHandle(index, collection, onComplete)
      },
      index * 0.02
    );
  });
};

const discardAnimationHandle = (
  collection,
  cardDimension,
  containerElement,
  onComplete
) => {
  const gsapTimeline = gsap.timeline();

  const discardCollection = collection.filter(({ discardFlag }) => discardFlag);

  const sortCollection = collection.filter(({ discardFlag }) => !discardFlag);

  const animationTotalCount =
    discardCollection.length + (sortCollection.length > 0 ? 1 : 0);

  let animationCompletedCount = 0;

  const _onComplete = () => {
    animationCompletedCount++;

    animationCompletedCount === animationTotalCount && onComplete();
  };

  discardCollection.map((card, index, collection) => {
    const element = containerElement.getChildByLabel(card.id);

    gsap.set(element, {
      pixi: { zIndex: collection.length + index }
    });

    gsapTimeline.to(
      element,
      {
        pixi: {
          ...(() => {
            const { width, height } = cardDimension;

            return {
              x: containerElementWidthGet(containerElement) + width / 2,
              y: -height / 2,
              angle: 20,
              skewX: -50,
              skewY: 50
            };
          })(),
          alpha: 0
        },
        duration: 0.25,
        ease: 'back.out(1.4)',
        onComplete: _onComplete
      },
      index * 0.05
    );
  });

  sortAnimationHandle(
    sortCollection,
    cardDimension,
    containerElement,
    _onComplete
  );
};

const handPlayedAnimationHandle = (
  collection,
  cardDimension,
  containerElement,
  onComplete
) => {
  const gsapTimeline = gsap.timeline();

  const handPlayedCollection = collection.filter(
    ({ playedFlag }) => playedFlag
  );

  const sortCollection = collection.filter(({ playedFlag }) => !playedFlag);

  const animationTotalCount =
    handPlayedCollection.length + (sortCollection.length > 0 ? 1 : 0);

  let animationCompletedCount = 0;

  const _onComplete = () => {
    animationCompletedCount++;

    animationCompletedCount === animationTotalCount && onComplete();
  };

  handPlayedCollection.map((card, index, collection) => {
    const element = containerElement.getChildByLabel(card.id);

    gsap.set(element, { pixi: { zIndex: collection.length + index } });

    gsapTimeline.to(
      element,
      {
        ...{
          pixi: {
            y: (() => {
              const { height } = cardDimension;

              return -height / 4;
            })(),
            angle: 0,
            alpha: 0
          }
        },
        duration: 0.25,
        ease: 'back.out(1.4)',
        onComplete: _onComplete
      },
      index * 0.05
    );
  });

  sortAnimationHandle(
    sortCollection,
    cardDimension,
    containerElement,
    _onComplete
  );
};

const reorderAnimationHandle = (
  collection,
  hand,
  cardDimension,
  containerElement,
  onComplete
) => {
  const gsapTimeline = gsap.timeline();

  collection.map((card, index, collection) => {
    const element = containerElement.getChildByLabel(card.id);

    const indexCurrent = hand.findIndex(({ id }) => id === card.id);

    gsapTimeline.to(
      element,
      {
        pixi: cardTransformGet(
          indexCurrent,
          hand,
          cardDimension,
          containerElement
        ),
        duration: 0.15,
        ease: 'back.out(0.8)',
        onComplete: () =>
          onCardCollectionAnimationCompleteHandle(index, collection, onComplete)
      },
      0
    );
  });
};

const handReoderedGet = (hand, cardDimension, target) => {
  const { label = {} } = target;
  const cardId = Number(label);

  const { offset, cardWidth } = _cardTransformGet(
    hand,
    cardDimension,
    target.parent.parent
  );

  const x = target.x - cardDimension.width / 2;

  const index = Math.abs(
    _.clamp(Math.round((x - offset) / (cardWidth || 1)), 0, hand.length - 1)
  );

  return (
    index !== hand.findIndex(({ id }) => id === cardId) &&
    (() => {
      const _hand = hand.filter(({ id }) => id !== cardId);

      return [
        ..._hand.slice(0, index),
        { ...hand.find(({ id }) => id === cardId), activeFlag: false },
        ..._hand.slice(index)
      ];
    })()
  );
};

const onWindowPointerMoveHandle = (
  cardDimension,
  event,
  dragRef,
  dragInProgressFlagSet,
  reorderTriggerFlagSet
) => {
  const { current: { target, offset, positionStart, _hand } = {} } = dragRef;

  target &&
    (() => {
      const { clientX, clientY } = event;

      const { x, y } = positionStart;

      return Math.hypot(clientX - x, clientY - y) > 10;
    })() &&
    (() => {
      Object.assign(target, { zIndex: _hand.length });

      Object.assign(
        target,
        (() => {
          const { x, y } = /** @type {pixiJs.Container & Element} */ (
            target.parent
          ).toLocal(
            (() => {
              const { clientX = 0, clientY = 0 } = /** @type {PointerEvent} */ (
                event
              );

              return { x: clientX, y: clientY };
            })()
          );

          const { x: _x, y: _y } = offset;

          return {
            x: x - _x,
            y: y - _y
          };
        })()
      );

      Object.assign(dragRef, {
        current: { ...dragRef.current, activatedFlag: true }
      });

      const __hand = handReoderedGet(_hand, cardDimension, target);

      __hand &&
        (() => {
          Object.assign(dragRef, {
            current: { ...dragRef.current, _hand: __hand }
          });

          reorderTriggerFlagSet(true);

          dragInProgressFlagSet(true);
        })();
    })();
};

const onPointerDownHandle = (
  hand,
  cardDimension,
  event,
  dragRef,
  dragInProgressFlagSet,
  reorderTriggerFlagSet
) => {
  !dragRef.current &&
    (() => {
      const target = /** @type {pixiJs.Container & Element} */ (
        event.currentTarget
      );

      Object.assign(dragRef, {
        current: {
          target,
          pointerId: event.pointerId,
          offset: (() => {
            const { x, y } = event.getLocalPosition(target.parent);

            const { x: _x, y: _y } = target;

            return {
              x: x - _x,
              y: y - _y
            };
          })(),
          activatedFlag: false,
          positionStart: (() => {
            const { clientX, clientY } = event;

            return { x: clientX, y: clientY };
          })(),
          _hand: hand,
          onWindowPointerMoveHandle: (event) =>
            onWindowPointerMoveHandle(
              cardDimension,
              event,
              dragRef,
              dragInProgressFlagSet,
              reorderTriggerFlagSet
            )
        }
      });

      window.addEventListener(
        'pointermove',
        dragRef.current.onWindowPointerMoveHandle
      );
    })();
};

const onPointerUpHandle = (
  hand,
  cardDimension,
  containerElement,
  dragRef,
  dragInProgressFlagSet,
  _handSet
) => {
  const { current: { target, activatedFlag, onWindowPointerMoveHandle } = {} } =
    dragRef;

  Object.assign(dragRef, { current: undefined });

  window.removeEventListener('pointermove', onWindowPointerMoveHandle);

  const onComplete = () => {
    dragInProgressFlagSet(false);

    activatedFlag && _handSet(hand);
  };

  activatedFlag
    ? (() => {
        const indexCurrent = hand.findIndex(
          ({ id }) => id === Number(target.label)
        );

        gsap.set(target, { pixi: { scale: 1 }, zIndex: indexCurrent });

        gsap.to(target, {
          pixi: cardTransformGet(
            indexCurrent,
            hand,
            cardDimension,
            containerElement
          ),
          duration: 0.35,
          ease: 'back.out(0.6)',
          onComplete: () => onComplete()
        });
      })()
    : onComplete();
};

const Hand = ({
  sortTriggerFlag,
  discardTriggerFlag,
  handPlayedTriggerFlag,
  activeFlagClearTrigger,
  sortTriggerFlagSet,
  discardTriggerFlagSet,
  handPlayedTriggerFlagSet,
  activeFlagClearTriggerSet
}) => {
  useExtend({ LayoutContainer, Container, Sprite });

  const { contextSafe } = useGSAP();

  const {
    cardShadowTexture,
    cardDimension,
    discardCardCountMaximun,
    hand: _hand,
    handPlayedFlag,
    handSet: _handSet
  } = useStore(
    useShallow(
      ({
        bundle,
        cardDimension,
        discardCardCountMaximun,
        round: { hand, handPlayed },
        handSet
      }) => ({
        cardShadowTexture: bundle.miscellaneous.cardShadow,
        cardDimension,
        discardCardCountMaximun,
        hand,
        handPlayedFlag: !!handPlayed,
        handSet
      })
    )
  );

  const ref = useRef(undefined);

  const handPreviousRef = useRef(undefined);

  const dragRef = useRef(undefined);

  const cardCollectionRef = useRef({});

  const [layoutInitializedFlag, layoutInitializedFlagSet] = useState(false);

  const [hand, handSet] = useState(undefined);

  const [entryTriggerFlag, entryTriggerFlagSet] = useState(true);

  const [activeTriggerFlag, activeTriggerFlagSet] = useState(false);

  const [reorderTriggerFlag, reorderTriggerFlagSet] = useState(false);

  const [dragInProgressFlag, dragInProgressFlagSet] = useState(false);

  useTouchTilt({ hand, cardDimension, cardCollectionRef, containerRef: ref });

  useEffect(() => {
    const __handSet = () =>
      // eslint-disable-next-line @eslint-react/set-state-in-effect
      handSet((hand) => {
        Object.assign(handPreviousRef, { current: hand });

        return _hand;
      });

    switch (true) {
      case entryTriggerFlag:
        return handSet((hand) => {
          Object.assign(handPreviousRef, {
            current: _hand.map((card) => ({
              ...card,
              entryFlag: !hand?.map(({ id }) => id).includes(card.id)
            }))
          });

          return handPreviousRef.current;
        });

      case activeTriggerFlag:
        return __handSet();

      case sortTriggerFlag:
        return __handSet();

      case discardTriggerFlag:
        return handSet((hand) => {
          Object.assign(handPreviousRef, {
            current: hand.map((card) => ({
              ...card,
              discardFlag: !_hand.map(({ id }) => id).includes(card.id)
            }))
          });

          return handPreviousRef.current;
        });

      case !handPlayedTriggerFlag &&
        handPreviousRef.current?.some(({ playedFlag }) => playedFlag):
        return __handSet();

      case handPlayedTriggerFlag:
        return handSet((hand) => {
          Object.assign(handPreviousRef, {
            current: hand.map((card) => ({
              ...card,
              playedFlag: !_hand.map(({ id }) => id).includes(card.id)
            }))
          });

          return handPreviousRef.current;
        });

      case reorderTriggerFlag:
        return (() => {
          return handSet((hand) => {
            const { current: { target, _hand } = {} } = dragRef;

            return target && _hand
              ? (() => {
                  Object.assign(handPreviousRef, {
                    current: hand.filter(
                      ({ id }) => id !== Number(target.label)
                    )
                  });

                  return _hand;
                })()
              : hand;
          });
        })();
    }
  }, [
    activeTriggerFlag,
    sortTriggerFlag,
    discardTriggerFlag,
    entryTriggerFlag,
    handPlayedTriggerFlag,
    reorderTriggerFlag,
    _hand
  ]);

  useEffect(() => {
    activeFlagClearTrigger &&
      (() => {
        // eslint-disable-next-line @eslint-react/set-state-in-effect
        activeTriggerFlagSet(true);

        activeFlagClearTriggerSet(false);
      })();
  }, [activeFlagClearTrigger, activeFlagClearTriggerSet]);

  useGSAP(
    () => {
      entryTriggerFlag &&
        layoutInitializedFlag &&
        (() => {
          return entryAnimationHandle(
            handPreviousRef.current,
            cardDimension,
            ref.current,
            () => {
              entryTriggerFlagSet(false);
            }
          );
        })();
    },
    { dependencies: [hand] }
  );

  useGSAP(
    () => {
      activeTriggerFlag &&
        (() => {
          activeTriggerFlagSet(false);

          return activeAnimationHandle(
            hand,
            cardDimension,
            ref.current,
            () => {}
          );
        })();
    },
    { dependencies: [hand] }
  );

  useGSAP(
    () => {
      sortTriggerFlag &&
        (() => {
          sortTriggerFlagSet(false);

          return sortAnimationHandle(
            hand,
            cardDimension,
            ref.current,
            () => {}
          );
        })();
    },
    { dependencies: [hand] }
  );

  useGSAP(
    () => {
      discardTriggerFlag &&
        (() => {
          return discardAnimationHandle(
            handPreviousRef.current,
            cardDimension,
            ref.current,
            () => {
              discardTriggerFlagSet(false);

              entryTriggerFlagSet(true);
            }
          );
        })();
    },
    { dependencies: [hand] }
  );

  useGSAP(
    () => {
      handPlayedTriggerFlag &&
        (() => {
          return handPlayedAnimationHandle(
            handPreviousRef.current,
            cardDimension,
            ref.current,
            () => {
              handPlayedTriggerFlagSet(false);
            }
          );
        })();
    },
    { dependencies: [hand] }
  );

  useGSAP(
    () => {
      reorderTriggerFlag &&
        (() => {
          reorderTriggerFlagSet(false);

          return reorderAnimationHandle(
            handPreviousRef.current,
            hand,
            cardDimension,
            ref.current,
            () => {}
          );
        })();
    },
    { dependencies: [hand] }
  );

  const _onPointerUpHandle = contextSafe(
    () =>
      dragRef.current &&
      onPointerUpHandle(
        hand,
        cardDimension,
        ref.current,
        dragRef,
        dragInProgressFlagSet,
        _handSet
      )
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        // eslint-disable-next-line @eslint-react/unsupported-syntax
        height: (() => {
          const { height } = cardDimension;

          return height;
        })(),
        borderWidth: 0,
        borderColor: 0xff0000
      }}
      sortableChildren={true}
      onLayout={(event) => {
        layoutInitializedFlagSet(true);

        const eventTarget = event.target;

        eventTarget.children
          .find(({ children }) => children.length)
          ?.children.map((container, index) => {
            Object.assign(
              container,
              cardTransformGet(index, hand, cardDimension, eventTarget)
            );
          });
      }}
    >
      {hand?.map((card, index, collection) => {
        // eslint-disable-next-line @eslint-react/unsupported-syntax
        const activeFlagSetEnabled = (() =>
          collection
            .filter(({ id }) => id !== card.id)
            .filter(({ activeFlag }) => activeFlag).length <
          discardCardCountMaximun)();

        const cursor = activeFlagSetEnabled ? 'pointer' : undefined;

        return (
          <pixiContainer
            key={card.id}
            label={card.id}
            pivot={{ x: cardDimension.width / 2, y: cardDimension.height }}
            zIndex={index}
            eventMode={!handPlayedFlag ? 'static' : 'none'}
            cursor={cursor}
            onPointerTap={() => {
              switch (true) {
                case dragInProgressFlag:
                  return;

                case activeFlagSetEnabled:
                  // eslint-disable-next-line @eslint-react/unsupported-syntax
                  return (() => {
                    _handSet([
                      ...hand.slice(0, index),
                      {
                        ...card,
                        activeFlag: !card.activeFlag
                      },
                      ...hand.slice(index + 1)
                    ]);

                    activeTriggerFlagSet(true);
                  })();
              }
            }}
            onPointerDown={(event) =>
              onPointerDownHandle(
                hand,
                cardDimension,
                event,
                dragRef,
                dragInProgressFlagSet,
                reorderTriggerFlagSet
              )
            }
            onPointerUp={_onPointerUpHandle}
            onPointerUpOutside={_onPointerUpHandle}
          >
            <pixiSprite
              texture={cardShadowTexture}
              position={{ x: -10, y: -10 }}
              alpha={1}
            />

            <Card
              ref={(cardComponent) => {
                Object.assign(cardCollectionRef.current, {
                  [card.id]: cardComponent || undefined
                });
              }}
              cursor={cursor}
              idle={true}
              card={card}
            />
          </pixiContainer>
        );
      })}
    </pixiLayoutContainer>
  );
};

export default Hand;
