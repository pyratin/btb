import { useEffect, useRef } from 'react';

/**
 * @typedef {object} UseTouchTiltProps
 * @property {import('react').RefObject<import('pixi.js').Container | null>} containerRef
 *   Ref to the parent layout container.
 * @property {import('react').RefObject<
 *   Record<string, import('#browser/component/type/Card.js').CardRef | null>
 * >} cardCollectionRef
 *   Ref map of individual Card component instances.
 * @property {import('#browser/component/type/Card.js').Card[] | undefined} hand
 *   The current list of cards in hand.
 * @property {{ width: number; height: number }} cardDimension The dimension of
 *   each card.
 */

/**
 * Custom hook to handle slide-to-tilt interaction on mobile device touches
 * across a hand of cards.
 *
 * @param {UseTouchTiltProps} props The hook properties.
 */
const useTouchTilt = ({ containerRef, cardCollectionRef, hand, cardDimension }) => {
  const touchActiveFlagRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;

    switch (true) {
      case !container:
        return;

      default: {
        Object.assign(container, { eventMode: 'static' });

        const handlePointerDownHandle = (e) => {
          switch (true) {
            case e.pointerType === 'touch':
              Object.assign(touchActiveFlagRef, { current: true });

              break;
          }
        };

        const handlePointerUpHandle = () => {
          Object.assign(touchActiveFlagRef, { current: false });

          (hand || []).map((card) => {
            cardCollectionRef.current?.[card.id]?.resetTilt();
          });
        };

        const handleGlobalPointerMoveHandle = (e) => {
          switch (true) {
            case !touchActiveFlagRef.current:
              return;

            default: {
              const globalPos = e.global;

              const activeCard = [...(hand || [])]
                .reverse()
                .find((card) => {
                  const cardContainer = container.getChildByLabel(card.id);

                  return (
                    cardContainer &&
                    cardContainer.getBounds().containsPoint(globalPos.x, globalPos.y)
                  );
                });

              const activeCardId = activeCard?.id;

              (hand || []).map((card) => {
                switch (true) {
                  case card.id === activeCardId: {
                    const cardContainer = container.getChildByLabel(card.id);

                    const localPos = cardContainer.toLocal(globalPos);

                    const halfW = cardDimension.width / 2;

                    const halfH = cardDimension.height / 2;

                    const relativeX = (localPos.x - halfW) / halfW;

                    const relativeY = (localPos.y - halfH) / halfH;

                    const clampedX = Math.max(-1, Math.min(1, relativeX));

                    const clampedY = Math.max(-1, Math.min(1, relativeY));

                    const maxTiltX = 0.3;

                    const maxTiltY = 0.3;

                    cardCollectionRef.current?.[card.id]?.setTilt(
                      clampedY * maxTiltX,
                      -clampedX * maxTiltY
                    );

                    break;
                  }
                  default:
                    cardCollectionRef.current?.[card.id]?.resetTilt();

                    break;
                }
              });
            }
          }
        };

        container.on('pointerdown', handlePointerDownHandle);

        container.on('pointerup', handlePointerUpHandle);

        container.on('pointerupoutside', handlePointerUpHandle);

        container.on('pointercancel', handlePointerUpHandle);

        container.on('globalpointermove', handleGlobalPointerMoveHandle);

        return () => {
          container.off('pointerdown', handlePointerDownHandle);

          container.off('pointerup', handlePointerUpHandle);

          container.off('pointerupoutside', handlePointerUpHandle);

          container.off('pointercancel', handlePointerUpHandle);

          container.off('globalpointermove', handleGlobalPointerMoveHandle);
        };
      }
    }
  }, [containerRef, cardCollectionRef, hand, cardDimension]);
};

export default useTouchTilt;
