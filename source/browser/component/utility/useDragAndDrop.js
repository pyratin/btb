import { useState, useRef, useEffect } from 'react';
import _ from 'lodash';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const onCardCollectionAnimationCompleteHandle = (
  index,
  collection,
  onComplete
) => index === collection.length - 1 && onComplete();

const reorderAnimationHandle = (
  collection,
  hand,
  cardDimension,
  containerElement,
  cardTransformGet
) => {
  const gsapTimeline = gsap.timeline();

  collection.map((card, index, collection) => {
    const element = containerElement.getChildByLabel(card.id);

    const indexCurrent = hand.findIndex(({ id }) => id === card.id);

    element &&
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
            onCardCollectionAnimationCompleteHandle(index, collection, () => {})
        },
        0
      );
  });
};

const handReoderedGet = (
  hand,
  cardDimension,
  target,
  containerElement,
  _cardTransformGet
) => {
  const { label = {} } = target;

  const cardId = Number(label);

  const { offset, cardWidth } = _cardTransformGet(
    hand,
    cardDimension,
    containerElement
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

const useDragAndDrop = ({
  hand,
  cardDimension,
  containerRef,
  _cardTransformGet,
  cardTransformGet,
  handSet,
  _handSet
}) => {
  const dragRef = useRef(undefined);

  const handPreviousRef = useRef(undefined);

  const [dragInProgressFlag, dragInProgressFlagSet] = useState(false);

  const [reorderTriggerFlag, reorderTriggerFlagSet] = useState(false);

  const onWindowPointerMoveHandle = (event) => {
    const { current: { target, offset, positionStart, _hand } = {} } = dragRef;

    target &&
      (() => {
        const { x: currentX, y: currentY } = event.global;

        const { x: startX, y: startY } = positionStart;

        return Math.hypot(currentX - startX, currentY - startY) > 10;
      })() &&
      (() => {
        Object.assign(target, { zIndex: _hand.length });

        Object.assign(
          target,
          (() => {
            const { x, y } = /** @type {import('pixi.js').Container} */ (
              target.parent
            ).toLocal(event.global);

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

        const __hand = handReoderedGet(
          _hand,
          cardDimension,
          target,
          containerRef.current,
          _cardTransformGet
        );

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

  const onPointerDown = (event) => {
    !dragRef.current &&
      (() => {
        const target = event.currentTarget;

        const containerElement = containerRef.current;

        containerElement &&
          (() => {
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
                  const { x, y } = event.global;

                  return { x, y };
                })(),
                _hand: hand,
                onWindowPointerMoveHandle
              }
            });

            containerElement.on('globalpointermove', onWindowPointerMoveHandle);
          })();
      })();
  };

  const onPointerUp = () => {
    dragRef.current &&
      (() => {
        const {
          current: {
            target,
            activatedFlag,
            onWindowPointerMoveHandle: moveHandler
          } = {}
        } = dragRef;

        Object.assign(dragRef, { current: undefined });

        const containerElement = containerRef.current;

        containerElement &&
          moveHandler &&
          containerElement.off('globalpointermove', moveHandler);

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
      })();
  };

  // Sync handPreviousRef for external animations
  useEffect(() => {
    reorderTriggerFlag &&
      handSet((currentHand) => {
        const { current: { target, _hand } = {} } = dragRef;

        return target && _hand
          ? (() => {
              Object.assign(handPreviousRef, {
                current: currentHand.filter(
                  ({ id }) => id !== Number(target.label)
                )
              });

              return _hand;
            })()
          : currentHand;
      });
  }, [reorderTriggerFlag, handSet]);

  // Clean up globalpointermove on unmount
  useEffect(() => {
    const containerElement = containerRef.current;

    const dragCurrent = dragRef.current;

    return () => {
      dragCurrent?.onWindowPointerMoveHandle &&
        containerElement &&
        containerElement.off(
          'globalpointermove',
          dragCurrent.onWindowPointerMoveHandle
        );
    };
  }, [containerRef]);

  // Run reorder animation internally
  useGSAP(
    () => {
      const containerElement = containerRef.current;

      reorderTriggerFlag &&
        containerElement &&
        (() => {
          reorderTriggerFlagSet(false);

          return reorderAnimationHandle(
            handPreviousRef.current,
            hand,
            cardDimension,
            containerElement,
            cardTransformGet
          );
        })();
    },
    { dependencies: [hand], scope: containerRef }
  );

  return {
    dragInProgressFlag,
    onPointerDown,
    onPointerUp
  };
};

export default useDragAndDrop;
