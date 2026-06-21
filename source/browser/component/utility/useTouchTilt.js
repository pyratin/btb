import { useEffect, useRef } from 'react';

/**
 * @typedef {object} UseTouchTiltProps
 * @property {import('react').RefObject<import('pixi.js').Container | null>} containerRef
 *   Ref to the parent layout container.
 * @property {import('react').RefObject<
 *   Record<string, import('#browser/component/type/Card.js').CardRef | null>
 * >} cardsRef
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
const useTouchTilt = ({ containerRef, cardsRef, hand, cardDimension }) => {
  const isTouchActiveRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.eventMode = 'static';

    const handlePointerDown = (e) => {
      if (e.pointerType === 'touch') {
        isTouchActiveRef.current = true;
      }
    };

    const handlePointerUp = () => {
      isTouchActiveRef.current = false;
      hand?.forEach((card) => {
        cardsRef.current[card.id]?.resetTilt();
      });
    };

    const handleGlobalPointerMove = (e) => {
      if (!isTouchActiveRef.current) return;

      const globalPos = e.global;
      let activeCardId = null;

      // Find the topmost card (highest index/zIndex) that contains the touch point
      for (let i = (hand?.length || 0) - 1; i >= 0; i--) {
        const card = hand[i];
        const cardContainer = container.getChildByLabel(card.id);
        if (!cardContainer) continue;

        const bounds = cardContainer.getBounds();
        if (bounds.containsPoint(globalPos.x, globalPos.y)) {
          activeCardId = card.id;
          break;
        }
      }

      hand?.forEach((card) => {
        if (card.id === activeCardId) {
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
          cardsRef.current[card.id]?.setTilt(
            clampedY * maxTiltX,
            -clampedX * maxTiltY
          );
        } else {
          cardsRef.current[card.id]?.resetTilt();
        }
      });
    };

    container.on('pointerdown', handlePointerDown);
    container.on('pointerup', handlePointerUp);
    container.on('pointerupoutside', handlePointerUp);
    container.on('pointercancel', handlePointerUp);
    container.on('globalpointermove', handleGlobalPointerMove);

    return () => {
      container.off('pointerdown', handlePointerDown);
      container.off('pointerup', handlePointerUp);
      container.off('pointerupoutside', handlePointerUp);
      container.off('pointercancel', handlePointerUp);
      container.off('globalpointermove', handleGlobalPointerMove);
    };
  }, [containerRef, cardsRef, hand, cardDimension]);
};

export default useTouchTilt;
